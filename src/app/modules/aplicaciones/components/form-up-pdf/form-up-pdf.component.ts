import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { DynamicDialogRef } from 'primeng/dynamicdialog';

import { PrimeNGModule } from '@modules/shared/prime/prime.module';
import { Aplication } from '@modules/aplicaciones/interfaces/aplicacion.interface';
import { AplicacionesService } from '@modules/aplicaciones/services/aplicaciones.service';
import { ValidationService } from '@modules/shared/services/validation.service';

@Component({
  selector: 'form-up-pdf',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PrimeNGModule],
  templateUrl: './form-up-pdf.component.html',
  styleUrls: ['./form-up-pdf.component.scss']
})
export class FormUpPdfComponent implements OnInit, OnDestroy{
  @ViewChild('pdfFile', { static: false }) pdfFileInput!: ElementRef;
  private destroy$ = new Subject<void>();
  
  app!: Aplication;
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
    this.aplicacionService.appPDF$
      .pipe(takeUntil(this.destroy$))
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
    
    this.aplicacionService.savePDFFile(this.formFile.controls['pdfFile'].value, this.app)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (resp) => {
        if(resp && resp.isValid && resp.checkmarx){
          this.isDisabled = true;
          this.isUploadFile = false;
          this.ref.close(true);
          this.aplicacionService.appPDFSubject.next(null);
        }else if(resp && !resp.isValid){
          this.isUploadFile = false;
          this.isDisabled = false;
        }
      },
      error: () => {              
        this.isUploadFile = false;
      }
    });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
