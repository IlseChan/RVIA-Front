import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  lifeNotification: number = 3000; 
  constructor(private messageService: MessageService) { }

  successMessage(summary: string, detail: string, time:number | null = null): void {
    this.messageService.add({ 
      severity: 'success', 
      summary, 
      detail,
      life: time ? time : this.lifeNotification 
    });
  }

  errorMessage(summary: string, detail: string, time:number | null = null): void {
    this.messageService.add({ 
      severity: 'error', 
      summary, 
      detail,
      life: time ? time : this.lifeNotification 
    });
  }

  warnMessage(summary: string, detail: string, time:number | null = null): void {
    this.messageService.add({ 
      severity: 'warn', 
      summary, 
      detail,
      life: time ? time : this.lifeNotification 
    });
  }
}