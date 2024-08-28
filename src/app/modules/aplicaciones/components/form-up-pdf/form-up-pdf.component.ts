import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { Aplication } from '@modules/aplicaciones/interfaces/aplicaciones.interfaces';
import { AplicacionesService } from '@modules/aplicaciones/services/aplicaciones.service';
import { ValidationService } from '@modules/shared/services/validation.service';

@Component({
  selector: 'form-up-pdf',
  standalone: true,
  imports: [CommonModule,InputGroupAddonModule,InputGroupModule,
    ReactiveFormsModule,ButtonModule,InputTextModule,ProgressSpinnerModule],
  templateUrl: './form-up-pdf.component.html',
  styleUrl: './form-up-pdf.component.scss'
})
export class FormUpPdfComponent implements OnInit, OnDestroy{
  @ViewChild('pdfFile', { static: false }) pdfFileInput!: ElementRef;
  
  app!: Aplication;
  appSub!: Subscription;

  formFile!: FormGroup;
  sizeFile: number = 0;

  isLoadingData: boolean = true;
  isLoadingFile: boolean = false;
  isUploadFile: boolean = false;
  isDisabled: boolean = false;

  constructor(
    private aplicacionService: AplicacionesService,
    private vldtnSrv: ValidationService,
    private ref: DynamicDialogRef) {}

    
  ngOnInit(): void {
    this.appSub = this.aplicacionService.appPDF$
      .subscribe(app => {
        if(app){
          this.app = app;
          this.initForm();
          this.isLoadingData = false;
        }
      });
  }

  private initForm(): void {
    this.formFile = new FormGroup({
      pdfFile: new FormControl(null,[Validators.required,this.vldtnSrv.fileValidation('pdf')]),
    });
  }

  openSearch(): void {
    this.pdfFileInput.nativeElement.click();
  }

  onFileSelected(event: any): void {
    this.isLoadingFile = true;    
    const file = event.target.files[0];
    if(file){
      setTimeout(() => {
        this.formFile.patchValue({
          pdfFile: file
        });
        this.sizeFile = file.size / (1024 * 1024);
        this.isLoadingFile = false;
      }, 1500);
    }else{
      this.isLoadingFile = false;
    }
  }

  cancel(): void {
    this.formFile.reset();
    this.sizeFile = 0;
  }

  onSubmit(): void{
    if(this.formFile.invalid) return;
    if(this.isUploadFile || this.isDisabled) return;
    this.isUploadFile = true;

    console.log('Se subirá');
    console.log(this.formFile.value);

    // this.aplicacionService.saveCSVFile(this.formFile.value, this.app)
    // .subscribe({
    //   next: () => {
    //     this.isDisabled = true;
    //     this.isUploadFile = false;
    //     setTimeout(() => {
    //       this.ref.close();
    //       this.aplicacionService.appCSVSubject.next(null);
    //     }, 1000);
    //   },
    //   error: () => {              
    //     setTimeout(() => {
    //       this.isUploadFile = false
    //     },3200);
    //   }
    // });
  }
  
  ngOnDestroy(): void {
    if(this.appSub) this.appSub.unsubscribe();
  }
}
