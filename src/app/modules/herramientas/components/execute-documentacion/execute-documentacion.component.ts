import { NgFor, NgIf, CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
  selector: 'app-execute-documentacion',
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
  templateUrl: './execute-documentacion.component.html',
  styleUrls: ['./execute-documentacion.component.scss']
})
export class ExecuteDocumentacionComponent implements OnInit {

  isLoadingData: boolean = true;
  isRequest: boolean = false;
  label: string = 'Iniciar';

  formIA!: FormGroup;

  appsOpcs: AppsToUseSelect[] = [];
  appsSub!: Subscription;

  actionsOps = [
    { value: 1, txt: 'Si' },
    { value: 2, txt: 'No' },
  ];

  constructor(
    private aplicacionesService: AplicacionesService,
    private herramientasService: HerramientasService,
    private confirmationService: ConfirmationService 
  ){}

  ngOnInit(): void {
    this.appsSub = this.aplicacionesService.getWaitingApps()
      .subscribe((resp) => {        
        if(resp){
          this.appsOpcs = resp;
          this.initForm();
          this.isLoadingData = false;          
        }
      });
  }

  private initForm(): void {
    this.formIA = new FormGroup({
      idu_aplicacion: new FormControl(null, [Validators.required]),
      conIA: new FormControl(1, [Validators.required]),
    });
  }

  onSubmit(): void { 
    if(this.formIA.invalid || this.isRequest){
      this.formIA.markAllAsTouched();
      return;
    }

    const message = '¿Quieres documentar este proyecto?';
    this.confirmationService.confirm({
      message,
      header: 'Documentar Proyecto',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-success my-2',
      acceptLabel: 'Sí, continuar',
      rejectButtonStyleClass: 'p-button-outlined my-2',
      rejectLabel: 'No, cancelar',
      accept: () => {
        this.executeDocumentacion(); 
      },
      reject: () => {
        this.resetValues(); 
      }
    });
  }

  executeDocumentacion(): void {
    this.isRequest = true;
    this.label = 'Iniciando'; 

    this.herramientasService.addonsCall(this.formIA.value)
      .pipe(finalize(() => this.resetValues())) 
      .subscribe({
        next: (resp) => {
          this.label = 'Iniciado'; 
        },
        error: () => {              
          this.isRequest = false;
          this.label = 'Iniciar';
        }
      });
  }

  resetValues(): void {
    this.isRequest = false;
    this.label = 'Iniciar';
  }

  ngOnDestroy(): void {
    if(this.appsSub) this.appsSub.unsubscribe();
  }
}
