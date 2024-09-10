import { CommonModule, NgIf, NgFor } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil, switchMap, tap } from 'rxjs';
import { PrimeNGModule } from '@modules/shared/prime/prime.module';
import { AppsToUseSelect } from '@modules/aplicaciones/interfaces/aplicaciones.interfaces';
import { AplicacionesService } from '@modules/aplicaciones/services/aplicaciones.service';
import { HerramientasService } from '@modules/herramientas/services/herramientas.service';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'execute-documentacion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PrimeNGModule, NgIf, NgFor],
  providers: [ConfirmationService],
  templateUrl: './execute-documentacion.component.html',
  styleUrls: ['./execute-documentacion.component.scss']
})
export class ExecuteDocumentacionComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  isLoadingData: boolean = false;
  isRequest: boolean = false;
  label: string = 'Iniciar';

  form!: FormGroup;
  appsOpcs: AppsToUseSelect[] = [];

  constructor(
    private aplicacionesService: AplicacionesService,
    private herramientasService: HerramientasService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.setupFormValueChanges();
  }

  private initForm(): void {
    this.form = new FormGroup({
      idu_aplicacion: new FormControl(null, [Validators.required]),
      tipo_documentacion: new FormControl(null, [Validators.required]), 
    });
  }

  private setupFormValueChanges(): void {
    this.form.get('tipo_documentacion')?.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        tap(() => this.isLoadingData = true),
        switchMap((tipo) => {
          return this.getApps( + tipo);
        })
        

      )
      .subscribe({
        next: (apps) => {
          if (apps && apps.length) {
            this.appsOpcs = apps;
          } else {
            this.appsOpcs = [];
          }
          this.isLoadingData = false;
        },
        error: (error) => {
          this.isLoadingData = false;
        }
      });
  }

  private getApps(tipo: number) {
    const appType = tipo === 1 ? 1 : 2;
    return this.aplicacionesService.getSomeArchitecApps(appType);
  }

  onSubmit(): void {
    if (this.form.invalid || this.isRequest) {
       this.form.markAllAsTouched();
       return;
    }
 
    const tipoDocumentacion = Number(this.form.controls['tipo_documentacion'].value);
    const tipoDoc = tipoDocumentacion === 1 ? 'overview' : 'code';
    const message = tipoDocumentacion === 1 
       ? '¿Quieres documentar este proyecto como Overview?' 
       : '¿Quieres documentar el código de este proyecto?';
 
    this.confirmationService.confirm({
       message,
       header: 'Documentar Proyecto',
       icon: 'pi pi-file',
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
  executeDocumentacion(tipoDoc: string): void {
    this.isRequest = true;
    this.label = 'Iniciando'; 

    const idu_aplicacion = this.form.controls['idu_aplicacion'].value;

    this.herramientasService.startProcessDocumentationRVIA(idu_aplicacion, tipoDoc)
      .pipe(takeUntil(this.destroy$))    
      .subscribe({
        next: () => {
          this.label = 'Iniciado'; 
          setTimeout(() => {
            this.reset();
          }, 1000);
        },
        error: (error) => {
          this.isRequest = false;
          this.label = 'Iniciar';
        }
      });
  }

  reset(): void {
    this.form.reset({
      tipo_documentacion: this.form.get('tipo_documentacion')?.value 
    });
    this.isRequest = false;
    this.label = 'Iniciar';
    this.appsOpcs = []; 
  }

  resetValues(): void {
    this.isRequest = false;
    this.label = 'Iniciar';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}