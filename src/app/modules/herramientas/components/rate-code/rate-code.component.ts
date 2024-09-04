import { NgFor, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RadioButtonModule } from 'primeng/radiobutton';

import { AppsToUseSelect } from '@modules/aplicaciones/interfaces/aplicaciones.interfaces';
import { AplicacionesService } from '@modules/aplicaciones/services/aplicaciones.service';
import { HerramientasService } from '@modules/herramientas/services/herramientas.service';

@Component({
  selector: 'rate-code',
  standalone: true,
  imports: [ProgressSpinnerModule,NgIf,ButtonModule,ReactiveFormsModule,
    DropdownModule,RadioButtonModule,NgFor
  ],
  templateUrl: './rate-code.component.html',
  styleUrl: './rate-code.component.scss'
})
export class RateCodeComponent implements OnInit, OnDestroy {
  isLoadingData: boolean = true;
  isRequest: boolean = false;
  label: string = 'Iniciar';

  form!: FormGroup;

  appsOpcs: AppsToUseSelect[] = [];
  appsSub!: Subscription;
  
  constructor(
    private aplicacionesService: AplicacionesService,
    private herramientasService: HerramientasService 
  ){}

  ngOnInit(): void {
    this.getApps();
  }

  private getApps() {
    this.isLoadingData = true;
    this.appsSub = this.aplicacionesService.getSomeArchitecApps(3)
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

    this.herramientasService.startProcessRateCodeRVIA(this.form.value)
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
    if(this.appsSub) this.appsSub.unsubscribe();
   }
}