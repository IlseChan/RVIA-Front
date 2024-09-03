import { NgFor, NgIf, CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ConfirmDialogModule } from 'primeng/confirmdialog'; 
import { ConfirmationService } from 'primeng/api'; 

import { AppsToUseSelect } from '@modules/aplicaciones/interfaces/aplicaciones.interfaces';
import { AplicacionesService } from '@modules/aplicaciones/services/aplicaciones.service';
import { HerramientasService } from '@modules/herramientas/services/herramientas.service';

@Component({
  selector: 'test-case',  
  standalone: true,
  imports: [
    CommonModule,
    ProgressSpinnerModule,
    NgIf,
    ButtonModule,
    ReactiveFormsModule,
    DropdownModule,
    RadioButtonModule,
    NgFor,
    ConfirmDialogModule 
  ],
  providers: [ConfirmationService], 
  templateUrl: './test-case.component.html', 
  styleUrls: ['./test-case.component.scss'] 
})
export class TestCaseComponent implements OnInit, OnDestroy { 
  isLoadingData: boolean = true;
  isRequest: boolean = false;
  label: string = 'Iniciar';

  form!: FormGroup; 

  appsOpcs: AppsToUseSelect[] = [];
  appsSub!: Subscription;

  constructor(
    private aplicacionesService: AplicacionesService,
    private herramientasService: HerramientasService,
    private confirmationService: ConfirmationService 
  ){}

  ngOnInit(): void {
    this.getApps();
  }

  private getApps(): void {
    this.appsSub = this.aplicacionesService.getNoTestCasesApps()
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

    this.herramientasService.startProcessTestCasesRVIA(this.form.value)  
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
    if(this.appsSub) this.appsSub.unsubscribe();
  }
}
