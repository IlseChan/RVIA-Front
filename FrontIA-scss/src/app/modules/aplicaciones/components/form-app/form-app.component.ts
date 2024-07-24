import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AplicacionesService } from '@modules/aplicaciones/services/aplicaciones.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-form-apps-page',
  templateUrl: './form-app.component.html',
  styleUrls: ['./form-app.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class FormsAppsPageComponent {
  @ViewChild('zipInput', { static: false }) zipInput!: ElementRef;

  zipFile: File | null = null;
  zipFileName: string | null = null;
  gitlabUrl: string = '';
  showGitlabUrlInput: boolean = false;

  constructor(
    private aplicacionesService: AplicacionesService, 
    private router: Router){}

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
    alert('Acción cancelada');
  }

  onSave(): void {
    if (this.gitlabUrl && this.isValidGitlabUrl(this.gitlabUrl)) {
      console.log('GitLab URL válida:', this.gitlabUrl);
      this.aplicacionesService.saveGitLabUrl(this.gitlabUrl)
        .subscribe(resp => {
          this.router.navigate(['/apps/list-apps']);
        })
    } 
    
    if(this.zipFile && this.zipFileName){
      this.aplicacionesService.saveZipFile(this.zipFile)
        .subscribe(resp => {
          this.router.navigate(['/apps/list-apps']);
        });
    }
  }
}
