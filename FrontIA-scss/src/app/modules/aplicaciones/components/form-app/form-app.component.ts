import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  triggerFileInput(type: string): void {
    if (type === 'zip' && !this.gitlabUrl) {
      this.zipInput.nativeElement.click();
    }
  }

  onFileSelected(event: Event, type: string): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      if (type === 'zip') {
        this.zipFile = input.files[0];
        this.zipFileName = this.zipFile.name;
        this.gitlabUrl = ''; // Limpiar la URL de GitLab si se selecciona un ZIP
        this.showGitlabUrlInput = false; // Ocultar el campo de URL de GitLab
      }
    }
  }

  showGitlabInput(): void {
    this.showGitlabUrlInput = true;
    this.zipFile = null; // Limpiar el archivo ZIP si se selecciona GitLab
    this.zipFileName = null;
  }

  isValidGitlabUrl(url: string): boolean {
    const regex = /^(https:\/\/|http:\/\/)?(www\.)?gitlab\.com\/[\w\-]+\/[\w\-]+(\.git)?$/;
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
      alert(`URL de GitLab válida: ${this.gitlabUrl}`);
    } else {
      alert('Por favor, ingrese una URL válida de GitLab');
    }
  }
}
