import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { NotificationsService } from '@modules/shared/services/notifications.service';
import { HttpClient } from '@angular/common/http';
import { FormPDFtoCSV, OriginMethod } from '../interfaces/herramientas.interfaces';
import { ResponseSaveFile } from '@modules/aplicaciones/interfaces/aplicaciones.interfaces';

@Injectable({
  providedIn: 'root'
})
export class HerramientasService {
  private readonly baseUrl = environment.baseURL;

  constructor(
    private http: HttpClient,
    private notificationsService: NotificationsService
  ) { }

  downloadCSVFile(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/checkmarx/download/${id}`,{ responseType: 'blob' })
      .pipe(
        catchError(error => this.handleError(error, OriginMethod.GETDOWNLOADCSV))
      );
  }

  makeCSVFile(form: FormPDFtoCSV): Observable<ResponseSaveFile> {
  
    const formData = new FormData();
    formData.append('idu_aplicacion',form.appId.toString());
    formData.append('file',form.pdfFile);
    
    return this.http.post<ResponseSaveFile>(`${this.baseUrl}/checkmarx/recoverypdf`,formData)
    .pipe(
      catchError(error => this.handleError(error, OriginMethod.POSTMAKECSV))
    );
  }

  handleError(error: Error, origin: OriginMethod, extra?: string | number) {
    const title = 'Error';
    
    const errorsMessages = {
      GETDOWNLOADCSV: 'Error al descargar el CSV',
      POSTMAKECSV: 'Ha ocurrido un error al genear el CSV de del PDf', 
    };

    this.notificationsService.errorMessage(title,errorsMessages[origin]);
    return throwError(() => 'ERROR ERROR ERROR');
  }
}
