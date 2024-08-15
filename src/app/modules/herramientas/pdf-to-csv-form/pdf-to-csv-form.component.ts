import { NgIf } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { AplicacionesService } from '@modules/aplicaciones/services/aplicaciones.service';

import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-pdf-to-csv-form',
  standalone: true,
  imports: [DividerModule, InputGroupModule,InputGroupAddonModule,
    ButtonModule, NgIf, InputTextModule, ReactiveFormsModule
  ],
  templateUrl: './pdf-to-csv-form.component.html',
  styleUrl: './pdf-to-csv-form.component.scss'
})
export class PdfToCsvFormComponent implements OnInit{
  @ViewChild('pdfFile', { static: false }) pdfInput !: ElementRef;

  formFile!: FormGroup;
  isLoading: boolean = false;
  isUploadFile: boolean = false;
  sizeFile: number = 0;

  constructor(
    private aplicacionesService: AplicacionesService, 
  ){}

  ngOnInit(): void {
    this.initForm();

  }

  private initForm(): void {
    this.formFile = new FormGroup({
      pdfFile: new FormControl(null,[Validators.required, this.fileValidation as ValidatorFn]),
    });
  }

  private fileValidation(control: FormControl): ValidationErrors | null {
      console.log(control);
            
      // if(file){
      //   const fileType = file.type;
        
      //   if(fileType === ''){
      //     const elemts = file.name.split('.');
      //     const ext = elemts[elemts.length -1];

      //     return ext === '7z' ? null : { invalidType7z: true } 
      //   }

      //   if(type === 'zip'){
      //     const types = ['application/zip','application/x-zip-compressed'];
      //     return types.includes(fileType) ? null : { invalidTypeZip: true } 
      //   }
        
      //   if(type === 'pdf'){
      //     const types = ['application/pdf'];
      //     return types.includes(fileType) ? null : { invalidTypePdf: true }
      //   }
      // }
      return null;
  }

  openSearch(): void {
    this.pdfInput.nativeElement.click();
  }

  onFileSelected(event: any): void {
    this.isLoading = true;    
    const file = event.target.files[0];
    if(file){
      setTimeout(() => {
        this.formFile.patchValue({
          csvFile: file
        });
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
  }

  onSubmit(): void { 
    if(this.formFile.invalid){
      this.formFile.markAllAsTouched();
      return;
    }
      
    if(this.isUploadFile) return;
    this.isUploadFile = true;

    // this.aplicacionesService.
    // .subscribe({
    //   next: () => {
    //     // setTimeout(()=> {
    //     //   this.ref.close();
    //     //   this.aplicacionService.appCSVSubject.next(null);
    //     // },1500)
    //   },
    //   error: () => {              
    //     // setTimeout(() => {
    //     //   this.isUploadFile = false
    //     // },3200);
    //   }
    // });
  }

}
