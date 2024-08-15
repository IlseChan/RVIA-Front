import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { StepperModule } from 'primeng/stepper';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { AplicacionesService } from '@modules/aplicaciones/services/aplicaciones.service';
import { Language } from '@modules/aplicaciones/interfaces/aplicaciones.interfaces';

@Component({
  selector: 'form-sanitize',
  standalone: true,
  templateUrl: './form-sanitize.component.html',
  styleUrl: './form-sanitize.component.scss',
  imports: [CommonModule,ButtonModule,TooltipModule,
    StepperModule,RadioButtonModule,InputTextModule,ReactiveFormsModule,
    InputGroupModule,InputGroupAddonModule,FormsModule, DropdownModule,
    ProgressSpinnerModule]
})
export class FormSanitizeComponent implements OnInit {
  @ViewChild('zipInput', { static: false }) zipInput!: ElementRef;
  @ViewChild('pdfInput', { static: false }) pdfInput!: ElementRef;
  
  formFiles!: FormGroup;
  isUploadFile: boolean = false;
  isUploadProject: boolean = false;

  radioOps = [
    { value: 'zip', image: 'Cargar.png', tooltip: '.zip o .7z'},
    { value: 'git', image: 'gitlab.webp', tooltip: 'URL de Gitlab o Github'}
  ];

  actionsOps = [
    { value: 1, txt: 'Actualizar código' },
    { value: 2, txt: 'Sanitizar código' },
    { value: 3, txt: 'Migrar código' },
  ];

  isLoading: boolean = true;
  lenguagesOps: Language[] = [];

  constructor(
    private aplicacionesService: AplicacionesService, 
    private router: Router,
  ){}
  
  ngOnInit(): void {

    this.aplicacionesService.getLanguages()
    .subscribe({
      next: (resp) => {
        if(resp){
          this.initForm();
          this.lenguagesOps = resp;
          this.isLoading = false;
        }
      }
    });
  }

  private initForm(): void{
    this.formFiles = new FormGroup({
      type:    new FormControl('zip',[Validators.required]),
      zipFile: new FormControl(null,[this.fileValidation('zip')]),
      urlGit:  new FormControl(null,[this.isValidGitlabUrl as ValidatorFn]),
      pdfFile: new FormControl(null,[this.fileValidation('pdf')]),
      action:  new FormControl(1,[Validators.required]),
      language: new FormControl(null)
    });
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
        
        if(fileType === ''){
          const elemts = file.name.split('.');
          const ext = elemts[elemts.length -1];

          return ext === '7z' ? null : { invalidType7z: true } 
        }

        if(type === 'zip'){
          const types = ['application/zip','application/x-zip-compressed'];
          return types.includes(fileType) ? null : { invalidTypeZip: true } 
        }
        
        if(type === 'pdf'){
          const types = ['application/pdf'];
          return types.includes(fileType) ? null : { invalidTypePdf: true }
        }
      }
      return null;
    }
  } 
 
  isValidGitlabUrl(control: FormControl): ValidationErrors | null {
    const regex = /^(https?:\/\/)?(www\.)?(github|gitlab)\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(-[A-Za-z0-9_.-]*)?\.git$/;
    
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
        });
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

  onBack(step: string): void {
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

  get projectName(): string {
    if(this.formFiles.controls['type'].value === 'zip'){
      return this.formFiles.controls['zipFile'].value.name
    }

    if(this.formFiles.controls['type'].value === 'git'){
      return this.formFiles.controls['urlGit'].value;
    }

    return 'error'
  }

  uploadFiles(): void{
    if(this.isUploadProject) return;

    this.isUploadProject = true;
    const values = this.formFiles.value;
    
    if(![1,2,3].includes(values.action)) return;
    if(values.type === 'zip' && !values.zipFile) return;
    if(values.type === 'git' && !values.urlGit) return;
    if(values.action === 3 && !values.language) return;
    
    this.aplicacionesService.saveProjectWitPDF(this.formFiles.value)
      .subscribe({
        next: () => {
          setTimeout(() => {
            this.back();
          },3200);
        },
        error: () => {      
          setTimeout(() => {
            this.isUploadProject = false
          },3200);
        }
      });
  }

  back(): void{
    this.router.navigate(['apps/list-apps'],{ replaceUrl: true });
  }
}