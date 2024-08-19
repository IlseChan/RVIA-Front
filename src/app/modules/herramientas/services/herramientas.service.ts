import { Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { NotificationsService } from '@modules/shared/services/notifications.service';
import { HttpClient } from '@angular/common/http';
import { FormAddonCall, FormPDFtoCSV, OriginMethod } from '../interfaces/herramientas.interfaces';
import { Aplication } from '@modules/aplicaciones/interfaces/aplicaciones.interfaces';
import { CheckmarxPDFCSV } from '@modules/shared/interfaces/checkmarx.interface';

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

  makeCSVFile(form: FormPDFtoCSV): Observable<CheckmarxPDFCSV> {
  
    const formData = new FormData();
    formData.append('idu_aplicacion',form.appId.toString());
    formData.append('file',form.pdfFile);
    
    return this.http.post<CheckmarxPDFCSV>(`${this.baseUrl}/checkmarx/recoverypdf`,formData)
    .pipe(
      tap(resp => {
        if(resp && !resp.isValid){
          this.handleError(new Error('PDF no valido'), OriginMethod.POSTMAKECSVPY)
        }
      }), 
      catchError(error => this.handleError(error, OriginMethod.POSTMAKECSV))
    );
  }

  addonsCall(form: FormAddonCall){
    const body = { ...form };
    return this.http.post<Aplication>(`${this.baseUrl}/rvia`,body)
    .pipe(
      tap((app) => {
        const title = 'Proceso iniciado';
        const content = `¡El proceso para de la aplicación ${app.idu_aplicacion} ha con éxito!`
        this.notificationsService.successMessage(title,content);
      }),
      catchError(error => this.handleError(error, OriginMethod.POSTSTARTADDON))
    );
  }

  handleError(error: Error, origin: OriginMethod, extra?: string | number) {
    const title = 'Error';
    
    const errorsMessages = {
      GETDOWNLOADCSV: 'Error al descargar el CSV',
      POSTMAKECSV: 'Ha ocurrido un error al genear el CSV de del PDf',
      POSTMAKECSVPY: 'Ha ocurrido un error al generar el CSV, verifica que tu PDF sea valido para vulnerabilidades', 
      POSTSTARTADDON: 'Ha ocurrido un error al iniciar el proceso. Inentalo más tarde',
    };

    this.notificationsService.errorMessage(title,errorsMessages[origin]);
    return throwError(() => 'ERROR ERROR ERROR');
  }
}
