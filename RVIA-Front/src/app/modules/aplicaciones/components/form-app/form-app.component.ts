import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { StepperModule } from 'primeng/stepper';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';

import { AplicacionesService } from '@modules/aplicaciones/services/aplicaciones.service';
import { Aplication } from '@modules/aplicaciones/interfaces/aplicaciones.interfaces';

@Component({
  selector: 'app-form-apps-page',
  templateUrl: './form-app.component.html',
  styleUrls: ['./form-app.component.scss'],
  standalone: true,
  imports: [CommonModule,ButtonModule,ToastModule,TooltipModule,
    StepperModule,RadioButtonModule,InputTextModule,ReactiveFormsModule,
    InputGroupModule,InputGroupAddonModule],
  providers: [MessageService]
})
export class FormsAppsPageComponent implements OnInit{
  @ViewChild('zipInput', { static: false }) zipInput!: ElementRef;
  @ViewChild('pdfInput', { static: false }) pdfInput!: ElementRef;
  
  formFiles!: FormGroup;
  isUploadFile: boolean = false;
  isUploadProject: boolean = false;

  radioOps = [
    { value: 'zip', image: 'Cargar.png', tooltip: 'Usar zip'},
    { value: 'git', image: 'gitlab.webp', tooltip: 'Usar URL de Git Lab'}
  ];

  constructor(
    private aplicacionesService: AplicacionesService, 
    private router: Router,
    private messageService: MessageService 
  ){}

  ngOnInit(): void {
    this.formFiles = new FormGroup({
      type: new FormControl('zip',[Validators.required]),
      zipFile: new FormControl(null,[this.fileValidation('zip')]),
      urlGit: new FormControl(null,[this.isValidGitlabUrl as ValidatorFn]),
      pdfFile: new FormControl(null,[this.fileValidation('pdf')]),
    })
  }

  triggerFileInput(type: string): void {
    if(type === 'zip') this.zipInput.nativeElement.click();
    if(type === 'pdf') this.pdfInput.nativeElement.click();
  }

  fileValidation(type:string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const file = control.value;
      
      if(file){
        const fileType = file.type;

        if(type === 'zip'){
          const types = ['application/zip','application/x-zip-compressed'];
          return types.includes(fileType) ? null : { invalidTypeZip: true}
        }
        
        if(type === 'pdf'){
          const types = ['application/pdf'];
          return types.includes(fileType) ? null : { invalidTypePdf: true}
        }
      }
      return null;
    }
  } 
 
  isValidGitlabUrl(control: FormControl): ValidationErrors | null {
    const regex = /^(https:\/\/|http:\/\/)?(www\.)?github\.com\/[\w\-]+\/[\w\-]+\.git$/;
    
    const value = control.value;
    if(value){
      return regex.test(value) ? null : { invalidUrl: true }
    }

    return null
  }

  onFileSelected(event:any, formOption:string): void {
    this.isUploadFile = true;    
    const file = event.target.files[0];
    if(file){
      setTimeout(() => {
        this.formFiles.patchValue({
          [formOption]: file
        })
        this.isUploadFile = false;
      }, 1500);
    }else{
      this.isUploadFile = false;
    }
  } 

  isInputValid(): boolean {
    const opt = this.formFiles.controls['type'].value;
    const formZip = this.formFiles.controls['zipFile'];
    const zipValid = !formZip.errors && formZip.value !== null;
    const formGit = this.formFiles.controls['urlGit'];
    const gitValid = !formGit.errors && formGit.value !== null;
    
    return !(opt === 'zip' && zipValid) && !(opt === 'git' && gitValid);
  }

  onBack(step: string):void {
    if(step === 'project'){
      this.formFiles.patchValue({
        zipFile: null,
        urlGit: null
      })
      return;
    }

    if(step === 'pdf'){
      this.formFiles.patchValue({ pdfFile: null });
      return;
    }
  }

  uploadFiles(): void{
    if(this.isUploadProject) return;

    this.isUploadProject = true;
    const values = this.formFiles.value;
    
    if(!values.pdfFile) return;
    if(values.type === 'zip' && !values.zipFile) return;
    if(values.type === 'git' && !values.urlGit) return;

    this.aplicacionesService.saveProjectWitPDF(this.formFiles.value);
  }

  back():void {
    this.router.navigate(['apps/list-apps'],{ replaceUrl: true });
  }
}