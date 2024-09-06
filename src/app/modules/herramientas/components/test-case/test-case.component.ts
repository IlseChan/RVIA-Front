import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { ConfirmationService } from 'primeng/api';

import { PrimeNGModule } from '@modules/shared/prime/prime.module';
import { AppsToUseSelect } from '@modules/aplicaciones/interfaces/aplicaciones.interfaces';
import { AplicacionesService } from '@modules/aplicaciones/services/aplicaciones.service';
import { HerramientasService } from '@modules/herramientas/services/herramientas.service';

@Component({
  selector: 'test-case',  
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PrimeNGModule],
  providers: [ConfirmationService], 
  templateUrl: './test-case.component.html', 
  styleUrls: ['./test-case.component.scss'] 
})
export class TestCaseComponent implements OnInit, OnDestroy { 
  private destroy$ = new Subject<void>();
  isLoadingData: boolean = true;
  isRequest: boolean = false;
  label: string = 'Iniciar';

  form!: FormGroup; 
  appsOpcs: AppsToUseSelect[] = [];

  constructor(
    private aplicacionesService: AplicacionesService,
    private herramientasService: HerramientasService,
    private confirmationService: ConfirmationService 
  ){}

  ngOnInit(): void {
    this.getApps();
  }

  private getApps(): void {
    this.aplicacionesService.getSomeArchitecApps(2)
      .pipe(takeUntil(this.destroy$))  
      .subscribe((resp) => {        
        if(resp){
          this.appsOpcs = resp;
          this.initForm();
          this.isLoadingData = false;          
        }
      });
  }

  private initForm(): void {
    this.form = new FormGroup({  
      idu_aplicacion: new FormControl(null, [Validators.required]),
    });
  }

  onSubmit(): void { 
    if(this.form.invalid || this.isRequest){  
      this.form.markAllAsTouched();  
      return;
    }

    const message = '¿Deseas proceder con los casos de prueba?';  
    this.confirmationService.confirm({
      message,
      header: 'Casos de Prueba',  
      icon: 'pi pi-clipboard', 
      acceptButtonStyleClass: 'p-button-success my-2',
      acceptLabel: 'Sí, continuar',
      rejectButtonStyleClass: 'p-button-outlined my-2',
      rejectLabel: 'No, cancelar',
      accept: () => {
        this.executeTestCase();  
      },
      reject: () => {
        this.resetValues(); 
      }
    });
  }

  executeTestCase(): void {  
    this.isRequest = true;
    this.label = 'Iniciando'; 

    const idu_aplicacion = this.form.controls['idu_aplicacion'].value;
    this.herramientasService.startProcessTestCasesRVIA(idu_aplicacion)  
      .pipe(takeUntil(this.destroy$))    
      .subscribe({
        next: () => {
          this.label = 'Iniciado'; 
          setTimeout(() => {
            this.reset();
          }, 1000);
        },
        error: () => {              
          this.resetValues();
        }
      });
  }

  reset(): void {
    this.form.reset();
    this.resetValues();
    this.getApps();
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