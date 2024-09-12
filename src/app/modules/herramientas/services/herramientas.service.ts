import { Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { NotificationsService } from '@modules/shared/services/notifications.service';
import { FormAddonCall, FormPDFtoCSV, OriginMethod } from '../interfaces/herramientas.interfaces';
import { Aplication } from '@modules/aplicaciones/interfaces/aplicaciones.interfaces';
import { CheckmarxPDFCSV } from '@modules/shared/interfaces/checkmarx.interface';
import { AplicacionesService } from '@modules/aplicaciones/services/aplicaciones.service';

@Injectable({
  providedIn: 'root'
})
export class HerramientasService {
  private readonly baseUrl = environment.baseURL;

  constructor(
    private http: HttpClient,
    private notificationsService: NotificationsService,
    private aplicacionesService: AplicacionesService
  ) { }

  downloadCSVFile(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/checkmarx/download/${id}`, { responseType: 'blob' })
      .pipe(
        catchError(error => this.handleError(error, OriginMethod.GETDOWNLOADCSV))
      );
  }

  makeCSVFile({ idu_aplicacion, file }: FormPDFtoCSV): Observable<CheckmarxPDFCSV> {
    const formData = new FormData();
    formData.append('idu_aplicacion', idu_aplicacion.toString());
    formData.append('file', file);

    return this.http.post<CheckmarxPDFCSV>(`${this.baseUrl}/checkmarx/recoverypdf`, formData)
      .pipe(
        tap(resp => {
          if (resp && !resp.isValid) {
            this.handleError(new Error('PDF no válido'), OriginMethod.POSTMAKECSVPY);
          }

          if (resp && resp.isValid && resp.checkmarx) {
            this.aplicacionesService.changes = true;
          }
        }),
        catchError(error => this.handleError(error, OriginMethod.POSTMAKECSV))
      );
  }

  addonsCall(form: FormAddonCall) {
    const body = { ...form };
    return this.http.post<Aplication>(`${this.baseUrl}/rvia`, body)
      .pipe(
        tap((app) => {
          const title = 'Proceso iniciado';
          const content = `¡El proceso para la aplicación ${app.idu_aplicacion} ha iniciado con éxito!`;
          this.notificationsService.successMessage(title, content);
        }),
        tap((app) => this.aplicacionesService.changeStatusInProcess(app.idu_aplicacion)),
        catchError(error => this.handleError(error, OriginMethod.POSTSTARTADDON))
      );
  }

  startProcessRateCodeRVIA(idu_aplicacion: number): Observable<Aplication> {
    const body = { opcArquitectura: 4 };
    return this.http.patch<Aplication>(`${this.baseUrl}/applications/rate-project/${idu_aplicacion}`, body)
      .pipe(
        tap((app) => {
          const title = 'Proceso iniciado';
          const content = `¡El proceso para calificar código de la aplicación ${app.nom_aplicacion} ha iniciado con éxito!`;
          this.notificationsService.successMessage(title, content);
        }),
        tap(() => this.aplicacionesService.changes = true),
        catchError(error => this.handleError(error, OriginMethod.PATCHRATECODE))
      );
  }

  startProcessTestCasesRVIA(idu_aplicacion: number): Observable<Aplication> {
    const body = { opcArquitectura: 3 };
    return this.http.patch<Aplication>(`${this.baseUrl}/applications/test-cases/${idu_aplicacion}`, body)
      .pipe(
        tap((app) => {
          const title = 'Proceso iniciado';
          const content = `¡El proceso para generar casos de prueba de la aplicación ${app.nom_aplicacion} ha iniciado con éxito!`;
          this.notificationsService.successMessage(title, content);
        }),
        tap(() => this.aplicacionesService.changes = true),
        catchError(error => this.handleError(error, OriginMethod.PATCHRTESTCASE))
      );
  }

  startProcessDocumentationRVIA(idu_aplicacion: number, tipoDoc: string): Observable<Aplication> {
    // Construir el cuerpo de la solicitud en base al tipo de documentación
    const body = { opcArquitectura: tipoDoc === 'overview' ? 1 : 2 }; // Ajusta según la lógica de tu aplicación
    const endpoint = tipoDoc === 'overview' ? 'documentation' : 'documentation-code';

    return this.http.patch<Aplication>(`${this.baseUrl}/applications/${endpoint}/${idu_aplicacion}`, body)
      .pipe(
        tap((app) => {
          const title = 'Proceso iniciado';
          const content = `¡El proceso para documentar (${tipoDoc}) la aplicación ${app.nom_aplicacion} ha iniciado con éxito!`;
          this.notificationsService.successMessage(title, content);
        }),
        tap(() => this.aplicacionesService.changes = true),
        catchError(error => this.handleError(error, OriginMethod.PATCHRDOCCODE))
      );
  }

  private handleError(error: any, origin: OriginMethod, extra?: string | number) {
    const title = 'Error';

    const errorsMessages = {
      GETDOWNLOADCSV: 'Error al descargar el CSV.',
      PATCHRDOCCODE: 'Ha ocurrido un error al iniciar el proceso de documentar aplicación. Inténtalo más tarde.',
      PATCHRTESTCASE: 'Ha ocurrido un error al iniciar el proceso de casos de prueba. Inténtalo más tarde.',
      PATCHRATECODE: 'Ha ocurrido un error al iniciar el proceso de calificación de código. Inténtalo más tarde.',
      POSTMAKECSV: 'Ha ocurrido un error al generar el CSV del PDF.',
      POSTMAKECSVPY: 'Ha ocurrido un error al generar el CSV, verifica que tu PDF sea válido para vulnerabilidades.',
      POSTSTARTADDON: 'Ha ocurrido un error al iniciar el proceso. Inténtalo más tarde.',
    };

    this.notificationsService.errorMessage(title, errorsMessages[origin]);
    return throwError(() => new Error('Error en la solicitud'));
  }
}
