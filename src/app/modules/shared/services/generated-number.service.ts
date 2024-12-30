import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MessageService } from 'primeng/api';

import { environment } from '../../../../environments/environment';
import { NotificationsService } from './notifications.service';

@Injectable({
  providedIn: 'root'
})
export class GeneratedNumberService {
  private readonly baseUrl = environment.baseURL;
  
  constructor(
    private http: HttpClient,
    private notificationsService: NotificationsService
  ) {}

  getGeneratedNumber(): Observable<string> {
    return this.http.get(`${this.baseUrl}/rvia`, { responseType: 'text' }).pipe(
      catchError((error) => {
        const message = 'No se puede obtener el número de versión'; 
        this.notificationsService.errorMessage('Error',message);
        return of('x.x');  
      })
    );
  }

}
