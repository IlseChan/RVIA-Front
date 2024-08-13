import { CommonModule  } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { combineLatest, of, Subscription, switchMap, tap } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';

import { Aplication, CheckmarxCSV } from '@modules/aplicaciones/interfaces/aplicaciones.interfaces';
import { AplicacionesService } from '@modules/aplicaciones/services/aplicaciones.service';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'form-csv',
  standalone: true,
  imports: [CommonModule,InputGroupAddonModule,InputGroupModule,
    ReactiveFormsModule,ButtonModule,InputTextModule,ProgressSpinnerModule],
  templateUrl: './form-csv.component.html',
  styleUrl: './form-csv.component.scss',
})
export class FormCsvComponent implements OnInit, OnDestroy {
  @ViewChild('csvFile', { static: false }) csvFileInput!: ElementRef;

  app!: Aplication;
  csvInfo: CheckmarxCSV | never[] = [];
  appSub!: Subscription;

  formFile!: FormGroup;
  sizeFile: number = 0;
  fileName: string = '';

  isLoading: boolean = false;
  isUploadFile: boolean = false;
  isLoadingData: boolean = true;

  constructor(private aplicacionService: AplicacionesService,private ref: DynamicDialogRef) {}
  
  ngOnInit(): void {
    this.appSub = combineLatest([
      this.aplicacionService.appCSV$, 
      this.aplicacionService.appCSV$.pipe(
        switchMap((app) => {
          if (app) {
            return this.aplicacionService.getCSVAplication(app.idu_aplicacion);
          }
          return of([]);
        })
      )])
      .subscribe(([appCSV, csvData]) => {
        if (appCSV && csvData) {
          this.app = appCSV;
          this.csvInfo = csvData;
          this.initForm();
          this.isLoadingData = false;
        }
      });
  }

  private initForm(): void {
    
    this.formFile = new FormGroup({
      csvFile: new FormControl(null,[Validators.required,this.fileValidation('csv')]),
    });

    if(!Array.isArray(this.csvInfo)){
      this.fileName = this.csvInfo.nom_checkmarx;
    }
  }

  fileValidation(type:string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const file = control.value;
      
      if(file){
        const fileType = file.type;
        
        if(type === 'csv'){
          const types = ['text/csv'];
          return types.includes(fileType) ? null : { invalidTypeCSV: true }
        }
      }

      return null;
    }
  }
  
  isCsvInfoArray(): boolean {
    return Array.isArray(this.csvInfo);
  }

  openSearch(): void {
    this.csvFileInput.nativeElement.click();
  }

  onFileSelected(event: any): void {
    this.isLoading = true;    
    const file = event.target.files[0];
    if(file){
      setTimeout(() => {
        this.formFile.patchValue({
          csvFile: file
        });
        this.fileName = file.name;
        this.sizeFile = file.size / (1024 * 1024);
        this.isLoading = false;
      }, 1500);
    }else{
      this.isLoading = false;
    }
  }

  cancel(): void {
    this.formFile.reset();
    this.sizeFile = 0;
    
    this.fileName = !Array.isArray(this.csvInfo)
     ? this.csvInfo.nom_checkmarx
     : '';
  }

  onSubmit(): void { 
    if(this.formFile.invalid) return;
    if(this.isUploadFile) return;
    this.isUploadFile = true;

    this.aplicacionService.saveCSVFile(this.formFile.value, this.app)
    .subscribe({
      next: () => {
        setTimeout(()=> {
          this.ref.close();
          this.aplicacionService.appCSVSubject.next(null);
        },1500)
      },
      error: () => {              
        setTimeout(() => {
          this.isUploadFile = false
        },3200);
      }
    });
  }

  ngOnDestroy(): void {
    if(this.appSub) this.appSub.unsubscribe();
  }
}
