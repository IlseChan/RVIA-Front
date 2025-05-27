import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil, switchMap, tap } from 'rxjs';

import { ConfirmationService } from 'primeng/api';

import { PrimeNGModule } from '@modules/shared/prime/prime.module';
import { AplicacionesService } from '@modules/aplicaciones/services/aplicaciones.service';
import { HerramientasService } from '@modules/herramientas/services/herramientas.service';
import { AppsToUseSelect } from '@modules/aplicaciones/interfaces';
import { RviaLoaderComponent } from '@modules/shared/components/loader/loader.component';

@Component({
  selector: 'execute-documentacion',
  standalone: true,
  imports: [ReactiveFormsModule, PrimeNGModule, RviaLoaderComponent],
  providers: [ConfirmationService],
  templateUrl: './execute-documentacion.component.html',
})
export class ExecuteDocumentacionComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  isLoadingData = signal<boolean>(false);
  isRequest = signal<boolean>(false);
  label = computed<string>(() => {
    return this.isRequest() ? 'Iniciando' : 'Iniciar';
  });

  form!: FormGroup;
  appsOpcs: AppsToUseSelect[] = [];
  
  private fb = inject(FormBuilder);
  private aplicacionesService = inject(AplicacionesService);
  private herramientasService = inject(HerramientasService);
  private confirmationService = inject(ConfirmationService);

  ngOnInit(): void {
    this.initForm();
    this.setupFormValueChanges();
  }

  private initForm(): void {
    this.form = this.fb.group({
      idu_aplicacion: [null, [Validators.required]],
      tipo_documentacion: [null, [Validators.required]], 
    });
  }

  private setupFormValueChanges(): void {
    this.form.get('tipo_documentacion')?.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        tap(() => this.isLoadingData.set(true)),
        switchMap((tipo) => {
          return this.getApps( +tipo);
        })
      )
      .subscribe({
        next: (apps) => {
          if (apps && apps.length) {
            this.appsOpcs = apps;
          } else {
            this.appsOpcs = [];
          }
          this.isLoadingData.set(false);
        },
        error: () => {
          this.isLoadingData.set(false);
        }
      });
  }

  private getApps(type: number) {
    return this.aplicacionesService.getSomeArchitecApps(type);
  }

  onSubmit(): void {
    if (this.form.invalid || this.isRequest()) {
       this.form.markAllAsTouched();
       return;
    }
 
    const tipoDocumentacion = Number(this.form.controls['tipo_documentacion'].value);
    const tipoDoc = tipoDocumentacion === 1 ? 'overview' : 'code';
    const message = tipoDocumentacion === 1 
       ? '¿Quieres generar documentación completa de este proyecto?' 
       : '¿Quieres generar documentación por código de este proyecto?';
 
    this.confirmationService.confirm({
       message,
       header: 'Documentar Proyecto',
       icon: 'pi pi-exclamation-triangle !text-3xl',
       acceptButtonStyleClass: 'p-button-success my-2',
       acceptLabel: 'Sí, continuar',
       rejectButtonStyleClass: 'p-button-outlined my-2',
       rejectLabel: 'No, cancelar',
       accept: () => {
          this.executeDocumentacion(tipoDoc); 
       },
       reject: () => {
          this.resetValues(); 
       }
    });
  }

  executeDocumentacion(typeDoc: string): void {
    if(this.isRequest()) return;
    this.isRequest.set(true);

    const idu_aplicacion = this.form.controls['idu_aplicacion'].value;

    this.herramientasService.startProcessDocumentationRVIA(idu_aplicacion, typeDoc)
      .pipe(takeUntil(this.destroy$))    
      .subscribe({
        next: () => {
          setTimeout(() => {
            this.reset();
          }, 1000);
        },
        error: () => {
          this.isRequest.set(false);
        }
      });
  }

  reset(): void {
    this.form.reset({
      tipo_documentacion: this.form.get('tipo_documentacion')?.value 
    });
    this.isRequest.set(false);
    this.appsOpcs = []; 
  }

  resetValues(): void {
    this.isRequest.set(false);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}