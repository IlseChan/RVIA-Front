import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, map } from 'rxjs';

import { RadioButtonClickEvent } from 'primeng/radiobutton';

import { PrimeNGModule } from '@modules/shared/prime/prime.module';
import { AplicacionesService } from '@modules/aplicaciones/services/aplicaciones.service';
import { ValidationService } from '@modules/shared/services/validation.service';
import { Language, NumberAction } from '@modules/aplicaciones/interfaces';

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
  @ViewChild('inputspan', { static: false }) spanInput!: ElementRef;
  @ViewChild('inputspanpdf', { static: false }) spanpdfInput!: ElementRef;
  private destroy$ = new Subject<void>();
  
  txtSizeFile: number = 340;
  txtSizepdfFile: number = 340;
  formFiles!: FormGroup;
  isUploadFile: boolean = false;
  isUploadProject: boolean = false;
  isMigrationEnabled = false; // ← Aquí controlas si esta activo o no
  isArchiOptionEnabled = false; // ← Aquí controlas si esas opciones están activas o no


  radioOps = [
    { value: 'zip', image: 'Cargar.png', tooltip: '.zip o .7z'},
    { value: 'git', image: 'gitlab.webp', tooltip: 'URL de Gitlab o Github'}
  ];

  actionsOps = [
    { value: NumberAction.UPDATECODE, txt: 'Actualizar código (Migración de versión a la más actual del mismo lenguaje)' },
    { value: NumberAction.MIGRATION, txt: 'Migrar código (Migración de un lenguaje de programación a otro)' },
    { value: NumberAction.SANITIZECODE, txt: 'Sanitizar código (Mitigación de vulnerabilidades checkmarx)' },
    { value: NumberAction.NONE, txt: 'No modificar código' },
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
  selectedValue: number = 1;
  readonly headersBase = [
    { label: 'Acciones'},
    { label: 'Tipo de proyecto'},
    { label: 'Seleccionar proyecto'},
    { label: 'Resumen'},
  ]; 
  headers = [...this.headersBase];
  NumberAction = NumberAction;

  constructor(
    private aplicacionesService: AplicacionesService, 
    private vldtnSrv: ValidationService,
    private router: Router,
  )
  
  {}
  
  ngOnInit(): void {
    this.isMigrationEnabled = false; // desactiva migración
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
      action: new FormControl(NumberAction.UPDATECODE),
      archiDocOverOpt: new FormControl([]),
      archiDocCodeOpt: new FormControl({ value: [], disabled: true }),
      archiCasesOpt: new FormControl({ value: [], disabled: true }),
      archiRateOpt: new FormControl({ value: [], disabled: true }),


      architecSelected: new FormControl(null, Validators.required),
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
        this.changeSizeInput(formOption,file.name);
        this.isUploadFile = false;
      }, 1500);
    }else{
      this.isUploadFile = false;
    }
  } 

  changeSizeInput(type: string,filename:string): void{

    if(type === 'zipFile'){
      this.spanInput.nativeElement.textContent = filename;
      this.txtSizeFile = this.spanInput.nativeElement.offsetWidth + 200;
      return
    }

    if(type === 'pdfFile'){
      this.spanpdfInput.nativeElement.textContent = filename;
      this.txtSizepdfFile = this.spanpdfInput.nativeElement.offsetWidth + 200;
      return
    }
  }

  changeRadioAction({ value }: RadioButtonClickEvent): void {
    if(this.selectedValue === value) return;
    
    this.selectedValue = value;
    if(this.selectedValue === NumberAction.SANITIZECODE){
      let itemsOpc = [...this.headersBase];
      itemsOpc.splice(this.headersBase.length - 1,0, { label: 'Seleccionar PDF' });
      this.headers = [...itemsOpc];       
    }else if(this.selectedValue === NumberAction.NONE){
      let itemsOpc = [...this.headersBase];
      itemsOpc.splice(this.headersBase.length - 1,0, { label: 'Arquitectura' });
      this.headers = [...itemsOpc];
    }else {
      this.headers = [...this.headersBase];
    }
  }
  setAction(value: number): void {
    if (value === NumberAction.MIGRATION && !this.isMigrationEnabled) return; // ← ELIMINA esta línea para permitir seleccionar la opción "Migrar código" desde la interfaz
    
    this.formFiles.get('action')?.setValue(value);
    this.changeRadioAction({ value } as RadioButtonClickEvent);
  }
  onRadioClick(selectedForm: string): void {
    this.formFiles.patchValue({
      archiDocOverOpt: [],
      archiDocCodeOpt: [],
      archiCasesOpt: [],
      archiRateOpt: [],
      [selectedForm]: [true]
    });
  }


  changeStep(value: number) {
    if(value < 0){
      if(this.activeIndex === 1){
        this.cleanInput('type');
      }
      
      if(this.activeIndex === 2){
        this.cleanInput('project');
      }
      
      if(this.activeIndex === 3 && this.selectedValue === NumberAction.NONE){
        this.cleanInput('architec');
      }

      if(this.activeIndex === 3 && this.selectedValue === NumberAction.SANITIZECODE){
        this.cleanInput('pdf');
      }
    }

    this.activeIndex += value;
    if (this.selectedValue === NumberAction.NONE && this.activeIndex === 3) {
      this.formFiles.patchValue({
        architecSelected: 'archiDocOverOpt' // <-- solo efecto visual
      });
    }
    
    if (!this.isMigrationEnabled && this.formFiles.get('action')?.value === NumberAction.MIGRATION) {
      this.formFiles.get('action')?.setValue(NumberAction.UPDATECODE); // ← ELIMINA todo este bloque si no quieres forzar el valor "Actualizar código" al volver atrás
      this.selectedValue = NumberAction.UPDATECODE;
    }
    if (
      this.selectedValue === NumberAction.NONE &&
      this.activeIndex === 4
    ) {
      // Agrega el paso "Resumen" si aún no está
      const hasResumen = this.headers.some(h => h.label === 'Resumen');
      if (!hasResumen) {
        this.headers.push({ label: 'Resumen' });
      }
    }
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
      this.txtSizeFile = 340;
    }

    if(type === 'pdf'){
      this.formFiles.patchValue({ pdfFile: null });
      this.txtSizepdfFile = 340;
    }
  }

  checkDisabled(): boolean {

    if(this.activeIndex === 0 && this.selectedValue === NumberAction.MIGRATION){
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

    if(this.activeIndex === 3 && this.selectedValue === NumberAction.SANITIZECODE){
      return !!this.formFiles.controls['pdfFile'].errors || 
        !this.formFiles.controls['pdfFile'].value 
    }

    if(this.activeIndex === 3 && this.selectedValue === NumberAction.NONE){
      const { 
       archiDocOverOpt, archiDocCodeOpt,
       archiCasesOpt,archiRateOpt } = this.formFiles.getRawValue();
       //= this.formFiles.value;     
       const allDisabled = 
          this.formFiles.get('archiDocCodeOpt')?.disabled &&
          this.formFiles.get('archiCasesOpt')?.disabled &&
          this.formFiles.get('archiRateOpt')?.disabled;

        if (allDisabled) return false;

        return !archiCasesOpt?.[0] && !archiDocOverOpt?.[0] &&
              !archiDocCodeOpt?.[0] && !archiRateOpt?.[0];
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
    const currentAction = this.actionsOps.find(opt => opt.value === this.selectedValue);
    return currentAction ? currentAction.txt : 'Error en nombre de la acción';
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
    return this.formFiles.controls['pdfFile'].value.name; 
  }

  get servicesProject(): string | null {
    const {
      archiDocOverOpt = [],
      archiDocCodeOpt = [],
      archiCasesOpt = [],
      archiRateOpt = []
    } = this.formFiles.value;
  
    const txtOpc: string[] = [];
  
    if (Array.isArray(archiDocOverOpt) && archiDocOverOpt[0]) txtOpc.push('Documentación completa');
    if (Array.isArray(archiDocCodeOpt) && archiDocCodeOpt[0]) txtOpc.push('Documentación por código');
    if (Array.isArray(archiCasesOpt) && archiCasesOpt[0]) txtOpc.push('Casos de pruebas');
    if (Array.isArray(archiRateOpt) && archiRateOpt[0]) txtOpc.push('Calificación de proyecto');
  
    return txtOpc.length > 0 ? txtOpc.join(' - ') : null;
  }

  uploadFiles(): void {
    console.log('Ejecutando uploadFiles...'); // 👈 Prueba básica
    if(this.isUploadProject) return;

    this.isUploadProject = true;
    const values = this.formFiles.value;


    const opt_archi = {
      '1': Array.isArray(values.archiDocOverOpt) && values.archiDocOverOpt.length > 0,
      '2': Array.isArray(values.archiDocCodeOpt) && values.archiDocCodeOpt.length > 0,
      '3': Array.isArray(values.archiCasesOpt) && values.archiCasesOpt.length > 0,
      '4': Array.isArray(values.archiRateOpt) && values.archiRateOpt.length > 0,
    };


    
    if(!this.actionOpsValues.includes(values.action)) return;
    if(values.type === 'zip' && !values.zipFile) return;
    if(values.type === 'git' && !values.urlGit) return;
    if(values.action === NumberAction.MIGRATION && !values.language) return;
    if(values.action === NumberAction.SANITIZECODE && !values.pdfFile) return;
  
    if(values.action === NumberAction.NONE){
      const v = Object.values(opt_archi).some(opt => opt === true);
      if(!v) return 
    }

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