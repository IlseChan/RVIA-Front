import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

import { AplicacionesService } from '@modules/aplicaciones/services/aplicaciones.service';
import { Aplication } from '@modules/aplicaciones/interfaces/aplicaciones.interfaces';

@Component({
  selector: 'app-form-apps-page',
  templateUrl: './form-app.component.html',
  styleUrls: ['./form-app.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule,ButtonModule,ToastModule,TooltipModule],
  providers: [MessageService]
})
export class FormsAppsPageComponent {
  @ViewChild('zipInput', { static: false }) zipInput!: ElementRef;

  zipFile: File | null = null;
  zipFileName: string | null = null;
  gitlabUrl: string = '';
  showGitlabUrlInput: boolean = false;
  isLoading: boolean = false;

  constructor(
    private aplicacionesService: AplicacionesService, 
    private router: Router,
    private messageService: MessageService 
  ){}

  triggerFileInput(type: string): void {
    if (type === 'zip' && !this.gitlabUrl) {
      this.zipInput.nativeElement.click();
    }
  }

  onFileSelected(event:any, type: string): void {
    const file: File = event.target.files[0];
    const types = ['zip','x-zip-compressed'];
    
    if(file && types.includes(file.type.split('/')[1])){
      this.zipFile = file
      this.zipFileName = file.name;
      this.gitlabUrl = ''; // Limpiar la URL de GitLab si se selecciona un ZIP
      this.showGitlabUrlInput = false; // Ocultar el campo de URL de GitLab
    }
  }

  showGitlabInput(): void {
    this.showGitlabUrlInput = true;
    this.zipFile = null; // Limpiar el archivo ZIP si se selecciona GitLab
    this.zipFileName = null;
  }

  isValidGitlabUrl(url: string): boolean {
    const regex = /^(https:\/\/|http:\/\/)?(www\.)?github\.com\/[\w\-]+\/[\w\-]+(\.git)?$/;
    return regex.test(url);
  }

  onCancel(): void {
    this.zipFile = null;
    this.zipFileName = null;
    this.gitlabUrl = '';
    this.showGitlabUrlInput = false;
  }

  onSave(): void {
    if(this.isLoading) return;
    this.isLoading = true;
    if (this.gitlabUrl && this.isValidGitlabUrl(this.gitlabUrl)) {
      this.aplicacionesService.saveGitLabUrl(this.gitlabUrl)
        .pipe(
          catchError(e => throwError(() => ({ error: true })))
        )  
        .subscribe({
          next: (app) => {
            if(app){
              this.handleResponse('success','GIT',app);
            }
          },
          error: () => {
            this.handleResponse('error','GIT');
          }
        })
    } 
    
    if(this.zipFile && this.zipFileName){
      this.aplicacionesService.saveZipFile(this.zipFile)
      .pipe(
        catchError(e => throwError(() => ({ error: true })))
      )  
      .subscribe({
        next: (app) => {
          if(app){
            this.handleResponse('success','ZIP',app);
          }
        },
        error: () => {
          this.handleResponse('error','ZIP');
        }
      });
    }
  }

  handleResponse(severity: string, type: string, app?: Aplication): void{
    let detail = '';
    let summary = '';

    if( severity === 'error'){
      summary = 'Error al guardar';

      if(type === 'GIT'){
        detail = 'Error al cargar el archivo desde URL';
      }
      
      if(type === 'ZIP'){
        detail = 'Error al cargar el archivo ZIP';
      }
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
      ? this.isLoading = false
      : this.router.navigate(['/apps/list-apps']);
    },3200)
  }
}
