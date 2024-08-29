import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { RadioButtonClickEvent, RadioButtonModule } from 'primeng/radiobutton';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { StepsModule } from 'primeng/steps';

import { AplicacionesService } from '@modules/aplicaciones/services/aplicaciones.service';
import { Language, OptAction, OptRadio, OptStepper } from '@modules/aplicaciones/interfaces/aplicaciones.interfaces';
import { ValidationService } from '@modules/shared/services/validation.service';

@Component({
  selector: 'form-sanitize',
  standalone: true,
  templateUrl: './form-sanitize.component.html',
  styleUrl: './form-sanitize.component.scss',
  imports: [CommonModule,ButtonModule,TooltipModule,
    RadioButtonModule,InputTextModule,ReactiveFormsModule,
    InputGroupModule,InputGroupAddonModule, DropdownModule,
    ProgressSpinnerModule,StepsModule]
})
export class FormSanitizeComponent implements OnInit {
  @ViewChild('zipInput', { static: false }) zipInput!: ElementRef;
  @ViewChild('pdfInput', { static: false }) pdfInput!: ElementRef;
  
  formFiles!: FormGroup;
  isUploadFile: boolean = false;
  isUploadProject: boolean = false;

  radioOps: OptRadio[] = [
    { value: 'zip', image: 'Cargar.png', tooltip: '.zip o .7z'},
    { value: 'git', image: 'gitlab.webp', tooltip: 'URL de Gitlab o Github'}
  ];

  actionsOps: OptAction[] = [
    { value: 1, txt: 'Actualizar código (Migración de versión a la más actual del mismo lenguaje)' },
    { value: 2, txt: 'Sanitizar código (Mitigación de vulnerabilidades checkmarx)' },
    { value: 3, txt: 'Migrar código (Migración de un lenguaje de programación a otro)' },
  ];

  isLoading: boolean = true;
  lenguagesOps: Language[] = [];

  activeIndex: number = 0;
  selectedValue: number = 1;
  readonly itemsBase: OptStepper[] = [
    { label: 'Acciones'},
    { label: 'Tipo de proyecto'},
    { label: 'Seleccionar proyecto'},
    { label: 'Resumen'},
  ]; 
  items: OptStepper[] = [...this.itemsBase];

  constructor(
    private aplicacionesService: AplicacionesService, 
    private vldtnSrv: ValidationService,
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
      zipFile: new FormControl(null,[this.vldtnSrv.fileValidation('zip'),this.vldtnSrv.noWhitespaceValidation()]),
      urlGit:  new FormControl(null,[this.vldtnSrv.isValidGitlabUrl()]),
      pdfFile: new FormControl(null,[this.vldtnSrv.fileValidation('pdf')]),
      action:  new FormControl(1,[Validators.required]),
      language: new FormControl(null)
    });
  }

  triggerFileInput(type: string): void {
    if(type === 'zip') this.zipInput.nativeElement.click();
    if(type === 'pdf') this.pdfInput.nativeElement.click();
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

  changeRadioAction({ value }: RadioButtonClickEvent): void {
    if(this.selectedValue === value) return;
    
    this.selectedValue = value;
    if(this.selectedValue === 2){
      let itemsOpc = [...this.itemsBase];
      itemsOpc.splice(3,0, {label: 'Seleccionar PDF*'});
      this.items = [...itemsOpc];       
    }else if(this.items.length === 5){
      this.items = [...this.itemsBase];
    }
  }

  changeStep(value: number) {
    if(this.activeIndex === 1 && value < 0){
      this.cleanInput('type');
    }

    if(this.activeIndex === 2 && value < 0){
      this.cleanInput('project');
    }

    if(this.activeIndex === 3 && this.selectedValue === 2 && value < 0){
      this.cleanInput('pdf');
    }

    this.activeIndex += value;
  }

  cleanInput(type: string): void {
    if(type === 'project'){
      this.formFiles.patchValue({
        zipFile: null,
        urlGit: null
      })
    }

    if(type === 'pdf'){
      this.formFiles.patchValue({ pdfFile: null });
    }

    if(type === 'type'){
      this.formFiles.patchValue({ type: 'zip' });
    }
  }

  checkDisabled(): boolean {
    
    if(this.activeIndex === 0 && this.selectedValue === 3){
     return this.formFiles.controls['language'].value === null
    }

    if(this.activeIndex === 1){
     return !(this.formFiles.controls['type'].value === 'zip' 
        || this.formFiles.controls['type'].value === 'git')  
    }

    if(this.activeIndex === 2){
      const opt = this.formFiles.controls['type'].value;
      const formZip = this.formFiles.controls['zipFile'];
      const zipValid = !formZip.errors && formZip.value !== null;
      const formGit = this.formFiles.controls['urlGit'];
      const gitValid = !formGit.errors && formGit.value !== null;
    
      return !(opt === 'zip' && zipValid) && !(opt === 'git' && gitValid);
    }

    if(this.activeIndex === 3 && this.selectedValue === 2){
      return !!this.formFiles.controls['pdfFile'].errors 
    }

    return false;
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

  get projectAction(): string {
    return this.actionsOps[this.selectedValue - 1].txt
  }

  get projectLanguage(): string {
    const num = this.formFiles.controls['language'].value - 1;
    return this.lenguagesOps[num].nom_lenguaje
  }

  get projectType(): string {
    return this.formFiles.controls['type'].value === 'zip' 
      ? this.radioOps[0].tooltip 
      : this.radioOps[1].tooltip 
  }

  get projectPDF(): string {
    return this.formFiles.controls['pdfFile'].value 
      ? this.formFiles.controls['pdfFile'].value.name 
      : 'No aplica'
  }

  uploadFiles(): void {
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
          this.back();
        },
        error: () => {      
          this.isUploadProject = false
        }
      });
  }

  back(): void {
    this.router.navigate(['apps/list-apps'],{ replaceUrl: true });
  }
}