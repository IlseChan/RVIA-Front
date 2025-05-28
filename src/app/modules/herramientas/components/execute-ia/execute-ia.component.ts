import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { PrimeNGModule } from '@modules/shared/prime/prime.module';
import { AplicacionesService } from '@modules/aplicaciones/services/aplicaciones.service';
import { HerramientasService } from '@modules/herramientas/services/herramientas.service';
import { AppsSelectIA, waitingOpc } from '@modules/herramientas/interfaces/appsSelectIA.interface';
import { Router } from '@angular/router';

@Component({
    selector: 'execute-ia',
    imports: [CommonModule, ReactiveFormsModule, PrimeNGModule],
    templateUrl: './execute-ia.component.html',
    styleUrls: ['./execute-ia.component.scss']
})
export class ExecuteIaComponent implements OnInit, OnDestroy{
  private destroy$ = new Subject<void>();
  isLoadingData: boolean = true;
  isRequest: boolean = false;
  label: string = 'Iniciar proceso';

  formIA!: FormGroup;
  appsOpcs: AppsSelectIA[] = [];
  processOpcs: waitingOpc[] = [];

  actionsOps = [
    { value: 1, txt: 'Si' },
    { value: 2, txt: 'No' },
  ];

  constructor(
    private aplicacionesService: AplicacionesService,
    private herramientasService: HerramientasService,
    private router: Router, 
  ){}

  ngOnInit(): void {
    this.getApps();
  }

  private getApps() {
    this.isLoadingData = true;
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
      opc_arquitectura: new FormControl(null,[Validators.required])
    });
  }

  appSelected(option:any){
    this.formIA.controls['opc_arquitectura'].reset();
    const app = this.appsOpcs.find(app => {
      return app.app === option 
    });

    if(app) this.processOpcs = app.waiting;
  }

  resetForm():void {
    this.formIA.patchValue({
      idu_aplicacion: null,
      conIA: 1,
      opc_arquitectura: null
    })
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
          setTimeout(() => {
            this.router.navigate(['apps/list-apps'],{ replaceUrl: true });
          }, 1000);
        },
        error: () => {              
          this.isRequest = false;
          this.label = 'Iniciar'
        }
    });
  }

  reset(): void {
    this.resetForm();
    this.isRequest = false;
    this.label = 'Iniciar'
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
   }
}