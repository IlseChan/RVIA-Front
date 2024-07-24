import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AplicacionesService } from '@modules/aplicaciones/services/aplicaciones.service';
import { Router } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Aplication } from '@modules/aplicaciones/interfaces/aplicaciones.interfaces';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-form-apps-page',
  templateUrl: './form-app.component.html',
  styleUrls: ['./form-app.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule,ButtonModule,ToastModule],
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
        .subscribe(app => {
          if(app){
            this.handleResponse(app,'success');
          }
      })
    } 
    
    if(this.zipFile && this.zipFileName){
      this.aplicacionesService.saveZipFile(this.zipFile)
        .subscribe(app => {
          if(app){
            this.handleResponse(app,'success');
          }
      });
    }
  }

  handleResponse(app: Aplication, severity: string): void{
    this.aplicacionesService.changeListSubject.next(true);
    this.showMessage(app.nom_aplicacion,severity);  
    setTimeout(() => {
      this.router.navigate(['/apps/list-apps']);
    },3200);
  }

  showMessage(nom_app:string, severity:string): void{
    const detail = `¡El aplicativo ${nom_app} se a subido con éxito!`; 
    const summary = 'Aplicativo guardado';

    this.messageService.add({ 
      severity, 
      summary, 
      detail 
    });
  }
}
