import { NgFor, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { AppsToUseSelect } from '@modules/aplicaciones/interfaces/aplicaciones.interfaces';
import { AplicacionesService } from '@modules/aplicaciones/services/aplicaciones.service';
import { RadioButtonModule } from 'primeng/radiobutton';
import { HerramientasService } from '@modules/herramientas/services/herramientas.service';

@Component({
  selector: 'execute-ia',
  standalone: true,
  imports: [ProgressSpinnerModule,NgIf,ButtonModule,ReactiveFormsModule,
    DropdownModule,RadioButtonModule,NgFor
  ],
  templateUrl: './execute-ia.component.html',
  styleUrls: ['./execute-ia.component.scss']
})
export class ExecuteIaComponent implements OnInit, OnDestroy{
  private destroy$ = new Subject<void>();
  isLoadingData: boolean = true;
  isRequest: boolean = false;
  label: string = 'Iniciar';

  formIA!: FormGroup;
  appsOpcs: AppsToUseSelect[] = [];

  actionsOps = [
    { value: 1, txt: 'Si' },
    { value: 2, txt: 'No' },
  ];

  constructor(
    private aplicacionesService: AplicacionesService,
    private herramientasService: HerramientasService 
  ){}

  ngOnInit(): void {
    this.aplicacionesService.getWaitingApps()
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
    this.formIA = new FormGroup({
      idu_aplicacion: new FormControl(null,[Validators.required]),
      conIA: new FormControl(1,[Validators.required]),
    });
  }

  onSubmit(): void { 
    if(this.formIA.invalid || this.isRequest){
      this.formIA.markAllAsTouched();
      return;
    }

    this.isRequest = true;
    this.label = 'Iniciando'; 

    this.herramientasService.addonsCall(this.formIA.value)
    .pipe(takeUntil(this.destroy$))    
    .subscribe({
        next: () => {
          this.label = 'Iniciado'; 
        },
        error: () => {              
          this.isRequest = false;
          this.label = 'Iniciar'
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
   }
}