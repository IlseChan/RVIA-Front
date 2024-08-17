import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  constructor(private messageService: MessageService) { }

  successMessage(summary: string, detail: string): void {
    this.messageService.add({ 
      severity: 'success', 
      summary, 
      detail 
    });
  }

  errorMessage(summary: string, detail: string): void {
    this.messageService.add({ 
      severity: 'error', 
      summary, 
      detail 
    });
  }

  warmMessage(summary: string, detail: string): void {
    this.messageService.add({ 
      severity: 'warm', 
      summary, 
      detail 
    });
  }
}
