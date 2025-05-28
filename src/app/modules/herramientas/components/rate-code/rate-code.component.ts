import { NgFor, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { PrimeNGModule } from '@modules/shared/prime/prime.module';
import { AplicacionesService } from '@modules/aplicaciones/services/aplicaciones.service';
import { HerramientasService } from '@modules/herramientas/services/herramientas.service';
import { AppsToUseSelect } from '@modules/aplicaciones/interfaces';

@Component({
    selector: 'rate-code',
    imports: [NgIf, ReactiveFormsModule, NgFor, PrimeNGModule],
    templateUrl: './rate-code.component.html',
    styleUrls: ['./rate-code.component.scss']
})
export class RateCodeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  isLoadingData: boolean = true;
  isRequest: boolean = false;
  label: string = 'Iniciar';

  form!: FormGroup;
  appsOpcs: AppsToUseSelect[] = [];
  
  constructor(
    private aplicacionesService: AplicacionesService,
    private herramientasService: HerramientasService 
  ){}

  ngOnInit(): void {
    this.getApps();
  }

  private getApps() {
    this.isLoadingData = true;
    this.aplicacionesService.getSomeArchitecApps(4)
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
      idu_aplicacion: new FormControl(null,[Validators.required]),
    });
  }
 
  onSubmit(): void {
    if(this.form.invalid || this.isRequest){
      this.form.markAllAsTouched();
      return;
    }
    this.isRequest = true;
    this.label = 'Iniciando'; 
  
    const idu_aplicacion = this.form.controls['idu_aplicacion'].value;
    this.herramientasService.startProcessRateCodeRVIA(idu_aplicacion)
      .pipe(takeUntil(this.destroy$))    
      .subscribe({
        next: () => {
          this.label = 'Iniciado'; 
          setTimeout(() => {
            this.reset();
          }, 1000);
        },
        error: () => {              
          this.isRequest = false;
          this.label = 'Iniciar'
        }
      });
  }

  reset(): void {
    this.form.reset();
    this.isRequest = false;
    this.label = 'Iniciar'
    this.getApps();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
   }
}