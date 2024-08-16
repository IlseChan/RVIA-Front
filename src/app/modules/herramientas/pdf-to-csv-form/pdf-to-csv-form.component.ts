import { NgIf } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';

import { Aplication, AppsSanitizadasSelect } from '@modules/aplicaciones/interfaces/aplicaciones.interfaces';
import { AplicacionesService } from '@modules/aplicaciones/services/aplicaciones.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { HerramientasService } from '../services/herramientas.service';

@Component({
  selector: 'app-pdf-to-csv-form',
  standalone: true,
  imports: [DividerModule, InputGroupModule,InputGroupAddonModule,
    ButtonModule, NgIf, InputTextModule, ReactiveFormsModule,
    DropdownModule,FormsModule,ProgressSpinnerModule
  ],
  templateUrl: './pdf-to-csv-form.component.html',
  styleUrl: './pdf-to-csv-form.component.scss'
})
export class PdfToCsvFormComponent implements OnInit, OnDestroy{
  @ViewChild('pdfFile', { static: false }) pdfInput !: ElementRef;

  formFile!: FormGroup;
  isLoading: boolean = false;
  isUploadFile: boolean = false;
  sizeFile: number = 0;
  isLoadingData: boolean = true;
  
  showDownOpc: boolean = false;
  infoDownloadFile: { name: string, id: number } = { name: '',id: -1 };
  isDownload: boolean = false;
  downloadSub!: Subscription;

  apps: Aplication[] = [];
  appsOpcs: AppsSanitizadasSelect[] = [];
  appsSub!: Subscription;

  constructor(
    private aplicacionesService: AplicacionesService, 
    private herramientasService: HerramientasService
  ){}

  ngOnInit(): void {
    this.appsSub = this.aplicacionesService.getSanitationApps()
      .subscribe((resp) => {        
        if(resp){
          this.appsOpcs = resp;
          this.initForm();
          this.isLoadingData = false;
        }
      });
  }

  private initForm(): void {
    this.formFile = new FormGroup({
      appId: new FormControl(null,[Validators.required]),
      pdfFile: new FormControl(null,[Validators.required, this.fileValidation as ValidatorFn]),
    });
  }

  private fileValidation(control: FormControl): ValidationErrors | null {
    const file = control.value;
      if(file){
        const fileType = file.type;
        const types = ['application/pdf'];

        return types.includes(fileType) ? null : { invalidTypePdf: true }
      }
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
          pdfFile: file
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
    this.isUploadFile = false;
  }

  onSubmit(): void { 
    if(this.formFile.invalid){
      this.formFile.markAllAsTouched();
      return;
    }
      
    if(this.isUploadFile) return;
    this.isUploadFile = true;

    this.herramientasService.makeCSVFile(this.formFile.value)
    .subscribe({
      next: (resp) => {
        this.showDownOpc = true;
        this.infoDownloadFile.id = resp.idu_checkmarx ;
        this.infoDownloadFile.name = resp.nom_checkmarx; 
      },
      error: () => {              
        setTimeout(() => {
          this.isUploadFile = false
        },3200);
      }
    });
  }

  onDownloadFile(): void {
    if(this.isDownload) return;
    this.isDownload = true;
    this.downloadSub = this.herramientasService.downloadCSVFile(this.infoDownloadFile.id)  
      .subscribe( {
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = `${this.infoDownloadFile.name}`;
          document.body.appendChild(anchor);
          anchor.click();
          document.body.removeChild(anchor);
          window.URL.revokeObjectURL(url);
          setTimeout(() => {
            this.isDownload = false;
          },2000);
        },
        error: () => {
          this.isDownload = false;
        }
      });
  }

  reset(): void {
    this.cancel();
    this.showDownOpc = false;
    this.infoDownloadFile = { name: '',id: -1 };
    this.isDownload = false;
  }

  ngOnDestroy(): void {
   if(this.appsSub) this.appsSub.unsubscribe();
   if(this.downloadSub) this.downloadSub.unsubscribe();
  }
}
