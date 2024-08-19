import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  lifeNotification: number = 10000; 
  constructor(private messageService: MessageService) { }

  successMessage(summary: string, detail: string): void {
    this.messageService.add({ 
      severity: 'success', 
      summary, 
      detail,
      life: this.lifeNotification 
    });
  }

  errorMessage(summary: string, detail: string): void {
    this.messageService.add({ 
      severity: 'error', 
      summary, 
      detail,
      life: this.lifeNotification 
    });
  }

  warnMessage(summary: string, detail: string): void {
    this.messageService.add({ 
      severity: 'warn', 
      summary, 
      detail,
      life: this.lifeNotification
    });
  }
}