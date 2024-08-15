import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, delay, map, Observable, of, tap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { Aplication, AplicationsData, CheckmarxCSV, FormCSV, FormProjectWithPDF, Language, OriginMethod, ResponseSaveCSV } from '../interfaces/aplicaciones.interfaces';
import { environment } from '../../../../environments/environment';
import { dataPerPage } from '@modules/shared/helpers/dataPerPage';
import { NotificationsService } from '@modules/shared/services/notifications.service';

@Injectable({
  providedIn: 'root'
})
export class AplicacionesService {
  private readonly baseUrl = environment.baseURL;
  private changes: boolean = false;

  appCSVSubject = new BehaviorSubject<Aplication | null>(null);
  appCSV$: Observable<Aplication | null> = this.appCSVSubject.asObservable();

  allApps: AplicationsData = {
    data: [],
    total: -1 
  }

  constructor(
    private http: HttpClient,
    private notificationsService: NotificationsService
  ){}

  clearDataApps(): void {
    this.allApps.data = [];
    this.allApps.total = -1; 
  }

  getAplicaciones(page: number = 1): Observable<AplicationsData> {
    if(this.allApps.data.length === 0 || this.changes){
      return this.http.get<Aplication[]>(`${this.baseUrl}/applications`)
        .pipe(
          tap(apps => {
            this.allApps.data = apps;
            this.allApps.total = apps.length;
            this.changes = false;
          }),
          map(apps => {
            return {
              data: dataPerPage([...apps],page) as Aplication[],
              total: this.allApps.total
            }
          }),
          delay(1000),
          catchError(error => this.handleError(error, OriginMethod.GETAPPS))
        )
      }
      else{
        return of(
          {
            data: dataPerPage([...this.allApps.data],page) as Aplication[],
            total: this.allApps.total
          }
        )
      }
  }
 
  setNewStatus(app: Aplication, newStatus: number): Observable<Aplication> {
    const body = { estatusId: newStatus };
    return this.http.patch<Aplication>(`${this.baseUrl}/applications/${app.idu_aplicacion}`,body)
      .pipe(
        tap(() => {
          const title = 'Estatus actualizado';
          const content = `¡El estado de la aplicación ${app.nom_aplicacion} 
            se a actualizado a ${app.applicationstatus.des_estatus_aplicacion} con éxito!`
          this.notificationsService.successMessage(title,content);
        }),
        delay(1000),
        catchError(error => this.handleError(error, OriginMethod.UPDATESTATUS,app.nom_aplicacion))
      );
  }

  saveProjectWitPDF(form: FormProjectWithPDF): Observable<Aplication> {
    const formData = new FormData();
    
    formData.append('num_accion',form.action.toString()); 

    if(form.action === 3){
      formData.append('opc_lenguaje',form.language.toString());
    }

    if(form.type === 'zip'){ 
      formData.append('files',form.zipFile!);
      if(form.pdfFile) formData.append('files',form.pdfFile!);
    
      return this.http.post<Aplication>(`${this.baseUrl}/applications/files`,formData)
        .pipe(
          tap(() => this.changes = true),
          tap((resp) => {
            const title = 'Aplicativo guardado';
            const content = `¡El aplicativo ${resp.nom_aplicacion} se ha subido con éxito!`
            this.notificationsService.successMessage(title,content);
          }),
          catchError(error => this.handleError(error, OriginMethod.POSTSAVEFILE))
        );
    }

    if(form.type === 'git'){
      formData.append('url',form.urlGit);
      if(form.pdfFile) formData.append('file',form.pdfFile);

      return this.http.post<Aplication>(`${this.baseUrl}/applications/git`,formData)
        .pipe(
          tap(() => this.changes = true),
          tap((resp) => {
            const title = 'Aplicativo guardado';
            const content = `¡El aplicativo ${resp.nom_aplicacion} se ha subido con éxito!`
            this.notificationsService.successMessage(title,content);
          }),
          catchError(error => this.handleError(error, OriginMethod.POSTSAVEFILE))
        );
    }

    return this.handleError(new Error('Error load new app'), OriginMethod.POSTSAVEFILE);
  }

  saveCSVFile(form: FormCSV, app: Aplication): Observable<ResponseSaveCSV> {
    
    const formData = new FormData();
    formData.append('idu_aplicacion',app.idu_aplicacion.toString());
    formData.append('file',form.csvFile);
    
    return this.http.post<ResponseSaveCSV>(`${this.baseUrl}/checkmarx`,formData)
    .pipe(
      tap(() => {
        const title = 'Archivo CSV guardado';
        const content = `¡El archivo .CSV del aplicativo ${app.nom_aplicacion} se ha subido con éxito!`
        this.notificationsService.successMessage(title,content);
      }),
      catchError(error => this.handleError(error, OriginMethod.POSTSAVECSV))
    );
  }

  getCSVAplication(id: number): Observable<CheckmarxCSV> {
    return this.http.get<CheckmarxCSV>(`${this.baseUrl}/checkmarx/${id}`)
    .pipe(
      catchError(error => this.handleError(error, OriginMethod.GETCSVAPP))
    );
  }

  getLanguages(): Observable<Language[]> {
    return this.http.get<Language[]>(`${this.baseUrl}/languages`)
    .pipe(
      delay(1000),
      catchError(error => this.handleError(error, OriginMethod.GETLANGUAGES))
    );    
  }

  downloadFile(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/applications/zip/${id}`,{ responseType: 'blob' })
      .pipe(
        catchError(error => this.handleError(error, OriginMethod.GETDOWNLOAD))
      );
  }

  handleError(error: Error, origin: OriginMethod, extra?: string | number) {
    const title = 'Error';
    console.log(error)
    const errorsMessages = {
      GETAPPS: 'Error al cargar información', 
      GETCSVAPP: 'Error al cargar información del CSV',
      GETDOWNLOAD: 'Error al descargar el zip',
      GETLANGUAGES: 'Ha ocurrido un error al cargar información. Intentalo de nuevo.',
      POSTSAVECSV: `Ocurió un error al guardar el archivo CSV. Inténtalo de nuevo`,
      POSTSAVEFILE: `Ocurió un error al guardar el aplicativo. Inténtalo de nuevo`,
      UPDATESTATUS: `¡El estado de la aplicación ${extra} no se pudo actualizar!`
    };

    this.notificationsService.errorMessage(title,errorsMessages[origin]);
    return throwError(() => 'ERROR ERROR ERROR');
  }
}