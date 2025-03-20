import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, throwError } from 'rxjs';
import { NotificationsService } from './notifications.service';

@Injectable({
  providedIn: 'root'
})
export class CoreService {
  private readonly baseUrl = environment.baseURL;

  private http = inject(HttpClient);
  private notificacionsSrvc = inject(NotificationsService);
  
  getCoreVersion(): Observable<string> {
    return this.http.get(`${this.baseUrl}/rvia`, { responseType: 'text' }).pipe(
      catchError((error) => {
        this.handleError(error, 'No se puede obtener el número de versión del core.');
        return of('');  
      })
    );
  }

  handleError(error: Error,message: string) {
    const title = 'Error';
    
    this.notificacionsSrvc.errorMessage(title,message);
    return throwError(() => 'ERROR ERROR [CORESERVICE]');
  }
}
