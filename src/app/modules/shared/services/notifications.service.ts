import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  constructor(private messageService: MessageService) { }

  //TODO mensaje para exito
  successMessage(summary: string, detail: string): void {
    this.messageService.add({ 
      severity: 'success', 
      summary, 
      detail 
    });
  }

  //TODO mensaje para error
  errorMessage(summary: string, detail: string): void {
    this.messageService.add({ 
      severity: 'error', 
      summary, 
      detail 
    });
  }
}
