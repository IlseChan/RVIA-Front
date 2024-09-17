import { NgIf } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { PrimeNGModule } from '@modules/shared/prime/prime.module';
import { AplicacionesService } from '@modules/aplicaciones/services/aplicaciones.service';
import { HerramientasService } from '../../services/herramientas.service';
import { ValidationService } from '@modules/shared/services/validation.service';
import { downloandFile } from '@modules/shared/helpers/downloadFile';
import { Aplication, AppsToUseSelect } from '@modules/aplicaciones/interfaces';

@Component({
  selector: 'pdf-to-csv-form',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule,FormsModule,PrimeNGModule],
  templateUrl: './pdf-to-csv-form.component.html',
  styleUrls: ['./pdf-to-csv-form.component.scss']
})
export class PdfToCsvFormComponent implements OnInit, OnDestroy{
  @ViewChild('file', { static: false }) pdfInput !: ElementRef;
  private destroy$ = new Subject<void>();

  formFile!: FormGroup;
  isLoading: boolean = false;
  isUploadFile: boolean = false;
  sizeFile: number = 0;
  isLoadingData: boolean = true;
  
  showDownOpc: boolean = false;
  infoDownloadFile: { name: string, id: number } = { name: '',id: -1 };
  isDownload: boolean = false;

  apps: Aplication[] = [];
  appsOpcs: AppsToUseSelect[] = [];

  constructor(
    private aplicacionesService: AplicacionesService, 
    private vldtnSrv: ValidationService,
    private herramientasService: HerramientasService
  ){}

  ngOnInit(): void {
    this.getApps();
  }

  getApps(){
    this.isLoadingData = true;
    this.aplicacionesService.getSanitationApps()
      .pipe(takeUntil(this.destroy$))  
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
      idu_aplicacion: new FormControl(null,[Validators.required]),
      file: new FormControl(null,[Validators.required, this.vldtnSrv.fileValidation('pdf')]),
    });
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
          file: file
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
      .pipe(takeUntil(this.destroy$))  
      .subscribe({
        next: (resp) => {
          if(resp && resp.isValid && resp.checkmarx){
            this.showDownOpc = true;
            this.infoDownloadFile.id = resp.checkmarx.idu_checkmarx ;
            this.infoDownloadFile.name = resp.checkmarx.nom_checkmarx;
          }else if(resp && !resp.isValid){
            this.isUploadFile = false;
            this.showDownOpc = false;
          }
        },
        error: () => {
          setTimeout(() => {
            this.isUploadFile = false
          },1200);
        }
      });
  }

  onDownloadFile(): void {
    if(this.isDownload) return;
    this.isDownload = true;
    this.herramientasService.downloadCSVFile(this.infoDownloadFile.id)  
      .pipe(takeUntil(this.destroy$))
      .subscribe( {
          next: (blob) => {
            downloandFile(blob, this.infoDownloadFile.name);
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
    this.getApps();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
