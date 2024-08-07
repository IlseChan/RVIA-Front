import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';

import { AplicacionesService } from '@modules/aplicaciones/services/aplicaciones.service';
import { Aplication } from '@modules/aplicaciones/interfaces/aplicaciones.interfaces';

@Component({
  selector: 'form-update',
  standalone: true,
  templateUrl: './form-update.component.html',
  styleUrl: './form-update.component.scss',
  imports: [CommonModule, FormsModule,ButtonModule,ToastModule,TooltipModule,InputTextModule],
  providers: [MessageService]
})
export class FormUpdateComponent {
  @ViewChild('zipInput', { static: false }) zipInput!: ElementRef;
  regexURL = /^(https:\/\/|http:\/\/)?(www\.)?github\.com\/[\w\-]+\/[\w\-]+(\.git)?$/;
  
  zipFile: File | null = null;
  gitlabUrl: string = '';
  showGitlabUrlInput: boolean = false;
  errorMessage: string = '';

  isUploadProject: boolean = false;
  isError: boolean = false;

  constructor(
    private aplicacionesService: AplicacionesService, 
    private router: Router,
    private messageService: MessageService 
  ){}

  triggerFileInput(): void {
    this.zipInput.nativeElement.click();
    this.showGitlabUrlInput = false;
    this.gitlabUrl = '';
  }

  onFileSelected(event:any): void {
    const file: File = event.target.files[0];
    const types = ['zip','x-zip-compressed'];

    if(file && types.includes(file.type.split('/')[1])){
      this.zipFile = file;
      this.isError = false;
    }else{
      this.isError = true;
      this.errorMessage = 'Error al cargar el archivo,extension valida .zip.';
    }
  }

  showGitlabInput(): void {
    this.gitlabUrl = '';
    this.showGitlabUrlInput = true;
    this.zipFile = null;
    this.isError = false;
  }

  isValidGitlabUrl(event: Event): void{
    const target = event.target as HTMLInputElement;
    const value = target.value;
    
    if(this.regexURL.test(value)){
      this.isError = false;
      this.gitlabUrl = value;
    }else{
      this.isError = true;
      this.errorMessage = 'Error en la URL.';
    }
  }

  onCancel(): void {
    this.zipFile = null;
    this.gitlabUrl = '';
    this.showGitlabUrlInput = false;
    this.isError = false;
  }

  onSave(): void {
    if(this.isUploadProject  || this.isError) return;
    this.isUploadProject = true;

    if (this.gitlabUrl !== '' && this.regexURL.test(this.gitlabUrl)) {
      console.log('Enviamos git');
      // this.aplicacionesService.saveGitLabUrl(this.gitlabUrl)
      //   .pipe(
      //     catchError(e => throwError(() => ({ error: true })))
      //   )  
      //   .subscribe({
      //     next: (app) => {
      //       if(app){
      //         this.handleResponse('success','GIT',app);
      //       }
      //     },
      //     error: () => {
      //       this.handleResponse('error','GIT');
      //     }
      //   })
    } 

    if(this.zipFile !== null && this.zipFile.type.includes('zip')){
      console.log('Enviamos zip')
      // this.aplicacionesService.saveZipFile(this.zipFile)
      // .pipe(
      //   catchError(e => throwError(() => ({ error: true })))
      // )  
      // .subscribe({
      //   next: (app) => {
      //     if(app){
      //       this.handleResponse('success','ZIP',app);
      //     }
      //   },
      //   error: () => {
      //     this.handleResponse('error','ZIP');
      //   }
      // });
    }
  }

  handleResponse(severity: string, type: string, app?: Aplication): void{
    let detail = '';
    let summary = '';

    if( severity === 'error'){
      summary = 'Error al guardar';
      detail = (type === 'GIT')
        ? 'Error al cargar el archivo desde URL'
        : 'Error al cargar el archivo ZIP'
    }

    if( severity === 'success'){
      summary = 'Aplicativo guardado';
      detail = `¡El aplicativo ${app?.nom_aplicacion} se a subido con éxito!`; 
      this.aplicacionesService.changeListSubject.next(true);
    }

    this.messageService.add({ 
      severity, 
      summary, 
      detail 
    });

    setTimeout(() => {
      severity === 'error' 
      ? this.isUploadProject = false
      : this.router.navigate(['/apps/list-apps'], { replaceUrl: true });
    },3200)
  }
}
