import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, delay, from, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { Aplication, AplicationsData, AppsToUseSelect, CheckmarxCSV,  
  FormPDF, FormProjectWithPDF, Language, NumberAction, Opt_architec, OriginMethod,
  ResponseAddApp, StatusApps } from '../interfaces/aplicaciones.interfaces';
import { environment } from '../../../../environments/environment';
import { dataPerPage } from '@modules/shared/helpers/dataPerPage';
import { NotificationsService } from '@modules/shared/services/notifications.service';
import { CheckmarxPDFCSV } from '@modules/shared/interfaces/checkmarx.interface';

@Injectable({
  providedIn: 'root'
})
export class AplicacionesService {
  private readonly baseUrl = environment.baseURL;
  changes: boolean = false;

  appPDFSubject = new BehaviorSubject<Aplication | null>(null);
  appPDF$: Observable<Aplication | null> = this.appPDFSubject.asObservable();

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

  //GET
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

  getSanitationApps(): Observable<AppsToUseSelect[]> {
    return of(this.allApps)
      .pipe(
        switchMap(infoApps => {
          if(infoApps.total !== -1 && !this.changes){
            return of(this.filterSanitationApps([...infoApps.data]))
          }
          return this.getAplicaciones().pipe(
            map(() => {
              return this.filterSanitationApps([...this.allApps.data])
            })
          )
        })
      );
  }

  getWaitingApps(): Observable<AppsToUseSelect[]> {
    return of(this.allApps)
    .pipe(
      switchMap(infoApps => {
        if(infoApps.total !== -1){
          return of(this.filterWaitingApps([...infoApps.data]))
        }
        return this.getAplicaciones().pipe(
          map(() => {
            return this.filterWaitingApps([...this.allApps.data])
          })
        )
      })
    );
  }
  
  getSomeArchitecApps(type: keyof Opt_architec): Observable<AppsToUseSelect[]>{
    return of(this.allApps)
    .pipe(
      switchMap(infoApps => {
        if(infoApps.total !== -1 && !this.changes){
          return of(this.filterTypeProcessApps([...infoApps.data],type))
        }
        return this.getAplicaciones().pipe(
          map(() => {
            return this.filterTypeProcessApps([...this.allApps.data],type)
          })
        )
      })
    );
  }

  private filterWaitingApps(data: Aplication[]): AppsToUseSelect[] {
    return data
      .filter(app => app.applicationstatus.idu_estatus_aplicacion === StatusApps.ONHOLD )
      .map( app => {
        return { value: app.idu_aplicacion, name: `${app.idu_proyecto} - ${app.nom_aplicacion}`}
      })
  }

  private filterSanitationApps(data: Aplication[]): AppsToUseSelect[]{
    return data
      .filter(app => app.num_accion === NumberAction.SANITIZECODE)
      .filter(app => app.checkmarx.length === 0)
      .map( app => {
        return { value: app.idu_aplicacion, name: `${app.idu_proyecto} - ${app.nom_aplicacion}`}
      })
  }

  private filterTypeProcessApps(data: Aplication[],type: number): AppsToUseSelect[] {
    return data
      .filter(app => !app.opc_arquitectura[type])
      .map( app => {
        return { value: app.idu_aplicacion, name: `${app.idu_proyecto} - ${app.nom_aplicacion}`}
      });
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

  //POST
  saveProjectWitPDF(form: FormProjectWithPDF): Observable<ResponseAddApp> {
    const formData = new FormData();

    formData.append('num_accion',form.action.toString()); 
    formData.append('opc_arquitectura', JSON.stringify(form.opt_archi))
    
    if(form.action === 3){
      formData.append('opc_lenguaje',form.language.toString());
    }

    if(form.type === 'zip'){ 
      formData.append('files',form.zipFile!);
      if(form.pdfFile) formData.append('files',form.pdfFile!);
    
      return this.http.post<ResponseAddApp>(`${this.baseUrl}/applications/files`,formData)
        .pipe(
          tap((resp) => this.savedSuccessfully(resp)),
          catchError(error => this.handleError(error, OriginMethod.POSTSAVEFILE))
        );
    }

    if(form.type === 'git'){
      formData.append('url',form.urlGit);
      if(form.pdfFile) formData.append('file',form.pdfFile);

      let endPoint: string;
      if(form.urlGit.includes('github.com')){
        endPoint = 'git';
      }else if(form.urlGit.includes('gitlab.com')){
        endPoint = 'gitlab';
      }else{
        return this.handleError(new Error('Error url'), OriginMethod.POSTSAVEFILE);
      }

      return this.http.post<ResponseAddApp>(`${this.baseUrl}/applications/${endPoint}`,formData)
        .pipe(
          tap((resp) => this.savedSuccessfully(resp)),
          catchError(error => this.handleError(error, OriginMethod.POSTSAVEFILE))
        );
    }

    return this.handleError(new Error('Error load new app'), OriginMethod.POSTSAVEFILE);
  }

  savePDFFile(form: FormPDF, app: Aplication): Observable<any> {
    
    const formData = new FormData();
    formData.append('idu_aplicacion',app.idu_aplicacion.toString());
    formData.append('file',form.pdfFile);
    
    return this.http.post<CheckmarxPDFCSV>(`${this.baseUrl}/checkmarx/upload-pdf`,formData)
    .pipe(
      tap(resp => {
        if(resp && !resp.isValid){
          this.handleError(new Error('PDF no válido'), OriginMethod.POSTSAVEPDF)
        }

        if(resp && resp.isValid){
          const title = 'Archivo PDF guardado';
          const content = `¡El archivo .PDF del aplicativo ${app.nom_aplicacion} se ha subido con éxito!`
          this.notificationsService.successMessage(title,content);
          this.changes = true;
        }
      }), 
      catchError(error => this.handleError(error, OriginMethod.POSTSAVEPDF))
    );
  }
  //PATCH
  setNewStatus(app: Aplication, newStatus: number): Observable<Aplication> {
    const body = { estatusId: newStatus };
    return this.http.patch<Aplication>(`${this.baseUrl}/applications/${app.idu_aplicacion}`,body)
      .pipe(
        delay(1000),
        tap(() => {
          const title = 'Estatus actualizado';
          const content = `¡El estado de la aplicación ${app.nom_aplicacion} 
          se ha actualizado a ${app.applicationstatus.des_estatus_aplicacion} con éxito!`
          this.notificationsService.successMessage(title,content);
        }),
        catchError(error => this.handleError(error, OriginMethod.UPDATESTATUS,app.nom_aplicacion))
      );
  }

  private savedSuccessfully(resp: ResponseAddApp){
    this.changes = true
    const title = 'Aplicativo guardado';
    const content = `¡El aplicativo ${resp.application.nom_aplicacion} se ha subido con éxito!`
    this.notificationsService.successMessage(title,content);

    if(!resp.checkmarx){
      const title = 'Archivo .csv no generado';
      const content = `¡El aplicativo se ha guardado correctamente pero el archivo .csv no se genero.`
      this.notificationsService.warnMessage(title,content);
    }
  }

  handleError(error: Error, origin: OriginMethod, extra?: string | number) {
    const title = 'Error';
    
    const errorsMessages = {
      GETAPPS: 'Error al cargar información', 
      GETCSVAPP: 'Error al cargar información del CSV',
      GETDOWNLOAD: 'Error al descargar el zip',
      GETLANGUAGES: 'Ha ocurrido un error al cargar información. Inténtalo de nuevo.',
      POSTSAVEPDF: `Ocurrió un error al guardar el archivo PDF. Inténtalo de nuevo`,
      POSTSAVEFILE: `Ocurrió un error al guardar el aplicativo. Inténtalo de nuevo`,
      UPDATESTATUS: `¡El estado de la aplicación ${extra} no se pudo actualizar!`
    };

    this.notificationsService.errorMessage(title,errorsMessages[origin]);
    return throwError(() => 'ERROR ERROR ERROR');
  }
}