import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { RadioButtonClickEvent } from 'primeng/radiobutton';

import { PrimeNGModule } from '@modules/shared/prime/prime.module';
import { AplicacionesService } from '@modules/aplicaciones/services/aplicaciones.service';
import { Language, OptAction, OptRadio, OptStepper } from '@modules/aplicaciones/interfaces/aplicaciones.interfaces';
import { ValidationService } from '@modules/shared/services/validation.service';

@Component({
  selector: 'form-sanitize',
  standalone: true,
  templateUrl: './form-sanitize.component.html',
  styleUrls: ['./form-sanitize.component.scss'],
  imports: [CommonModule,ReactiveFormsModule, PrimeNGModule]
})
export class FormSanitizeComponent implements OnInit, OnDestroy {
  @ViewChild('zipInput', { static: false }) zipInput!: ElementRef;
  @ViewChild('pdfInput', { static: false }) pdfInput!: ElementRef;
  private destroy$ = new Subject<void>();
  
  formFiles!: FormGroup;
  isUploadFile: boolean = false;
  isUploadProject: boolean = false;

  radioOps: OptRadio[] = [
    { value: 'zip', image: 'Cargar.png', tooltip: '.zip o .7z'},
    { value: 'git', image: 'gitlab.webp', tooltip: 'URL de Gitlab o Github'}
  ];

  actionsOps: OptAction[] = [
    { value: 0, txt: 'No modificar código' },
    { value: 1, txt: 'Actualizar código (Migración de versión a la más actual del mismo lenguaje)' },
    { value: 2, txt: 'Sanitizar código (Mitigación de vulnerabilidades checkmarx)' },
    { value: 3, txt: 'Migrar código (Migración de un lenguaje de programación a otro)' },
  ];
  actionOpsValues: number[] = this.actionsOps.map(a => a.value);
  
  actionArchitec = [
    { txt: 'Generar documentación completa', form: 'archiDocOverOpt' },
    { txt: 'Generar documentación por código', form: 'archiDocCodeOpt' },
    { txt: 'Generar casos de pruebas', form: 'archiCasesOpt' },
    { txt: 'Generar calificación de proyecto', form: 'archiRateOpt' },
  ];
  
  isLoading: boolean = true;
  lenguagesOps: Language[] = [];

  activeIndex: number = 0;
  selectedValue: number = 0;
  readonly itemsBase: OptStepper[] = [
    { label: 'Acciones'},
    { label: 'Arquitectura'},
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
    .pipe(takeUntil(this.destroy$))
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
      action:  new FormControl(0,[Validators.required]),
      archiDocOverOpt: new FormControl([]),
      archiDocCodeOpt: new FormControl([]),
      archiCasesOpt: new FormControl([]),
      archiRateOpt: new FormControl([]),
      language: new FormControl(null),
      pdfFile: new FormControl(null,[this.vldtnSrv.fileValidation('pdf')]),
      type:    new FormControl('zip',[Validators.required]),
      urlGit:  new FormControl(null,[this.vldtnSrv.isValidGitlabUrl()]),
      zipFile: new FormControl(null,[this.vldtnSrv.fileValidation('zip'),this.vldtnSrv.noWhitespaceValidation()]),
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
      itemsOpc.splice(this.itemsBase.length - 1,0, {label: 'Seleccionar PDF*'});
      this.items = [...itemsOpc];       
    }else if(this.items.length === this.itemsBase.length + 1){
      this.items = [...this.itemsBase];
    }
  }

  changeStep(value: number) {
    if(this.activeIndex === 1 && value < 0){
      this.cleanInput('architec');
    }

    if(this.activeIndex === 2 && value < 0){
      this.cleanInput('type');
    }

    if(this.activeIndex === 3 && value < 0){
      this.cleanInput('project');
    }

    if(this.activeIndex === 3 && this.selectedValue === 2 && value < 0){
      this.cleanInput('pdf');
    }

    this.activeIndex += value;
  }

  cleanInput(type: string): void {    
    if(type === 'architec'){
      this.formFiles.patchValue({
        archiDocOverOpt: false,
        archiDocCodeOpt: false,
        archiCasesOpt:   false,
        archiRateOpt:    false
      });
    }
    
    if(type === 'type'){
      this.formFiles.patchValue({ type: 'zip' });
    }

    if(type === 'project'){
      this.formFiles.patchValue({
        zipFile: null,
        urlGit: null
      })
    }

    if(type === 'pdf'){
      this.formFiles.patchValue({ pdfFile: null });
    }
  }

  checkDisabled(): boolean {
    
    if(this.activeIndex === 0 && this.selectedValue === 3){
     return this.formFiles.controls['language'].value === null
    }

    if(this.activeIndex === 1 && this.selectedValue === 0){
     const { 
      archiDocOverOpt, archiDocCodeOpt,
      archiCasesOpt,archiRateOpt } = this.formFiles.value;     
     return !archiCasesOpt[0] && !archiDocOverOpt[0] && !archiDocCodeOpt[0] && !archiRateOpt[0];
    }


    if(this.activeIndex === 2){
     return !(this.formFiles.controls['type'].value === 'zip' 
        || this.formFiles.controls['type'].value === 'git')  
    }

    if(this.activeIndex === 3){
      const opt = this.formFiles.controls['type'].value;
      const formZip = this.formFiles.controls['zipFile'];
      const zipValid = !formZip.errors && formZip.value !== null;
      const formGit = this.formFiles.controls['urlGit'];
      const gitValid = !formGit.errors && formGit.value !== null;
    
      return !(opt === 'zip' && zipValid) && !(opt === 'git' && gitValid);
    }

    if(this.activeIndex === 4 && this.selectedValue === 2){
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
    return this.actionsOps[this.selectedValue].txt
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

  get servicesProject(): string {
    const { 
      archiDocOverOpt, archiDocCodeOpt,
      archiCasesOpt,archiRateOpt } = this.formFiles.value;     
    const txtOpc = [];

    if(archiDocOverOpt[0]) txtOpc.push('Documentación completa');
    if(archiDocCodeOpt[0]) txtOpc.push('Documentación por código');
    if(archiCasesOpt[0])   txtOpc.push('Casos de pruebas');
    if(archiRateOpt[0])    txtOpc.push('Calificación de proyecto');

    if(txtOpc.length === 0) return 'No aplica';

    return txtOpc.join(' - ');
  }

  uploadFiles(): void {
    if(this.isUploadProject) return;

    this.isUploadProject = true;
    const values = this.formFiles.value;
    
    const opt_archi = {
      '1': values.archiDocOverOpt.length ? true : false, //1 - Documenacion overview
      '2': values.archiDocCodeOpt.length ? true : false, //2 - Documentacion por codigo
      '3': values.archiCasesOpt.length   ? true : false, //3 - Casos de prueba  
      '4': values.archiRateOpt.length    ? true : false  //4 - Calificación de codigo
    }
    
    if(!this.actionOpsValues.includes(values.action)) return;
    if(values.type === 'zip' && !values.zipFile) return;
    if(values.type === 'git' && !values.urlGit) return;
    if(values.action === 3 && !values.language) return;

    let { 
      archiCasesOpt, 
      archiDocOverOpt, 
      archiDocCodeOpt,
      archiRateOpt,
      ...info
    } = this.formFiles.value;
    
    info = {
      ...info,
      opt_archi
    }
    
    this.aplicacionesService.saveProjectWitPDF(info)
      .pipe(takeUntil(this.destroy$))  
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

  ngOnDestroy(): void{
    this.destroy$.next();
    this.destroy$.complete();
  }
}