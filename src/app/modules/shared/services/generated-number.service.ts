import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class GeneratedNumberService {
  private readonly apiUrl = 'http://localhost:3001/rvia'; 

  constructor(
    private http: HttpClient,
    private messageService: MessageService  
  ) {}

  getGeneratedNumber(): Observable<string> {
    return this.http.get(this.apiUrl, { responseType: 'text' }).pipe(
      catchError((error) => {
        this.errorMessage('Error', 'No se pudo generar el número');
        console.error('Error al obtener el número:', error);
        return of('');  
      })
    );
  }

  private errorMessage(summary: string, detail: string): void {
    this.messageService.add({ 
      severity: 'error', 
      summary, 
      detail,
      life: 3000  
    });
  }
}
