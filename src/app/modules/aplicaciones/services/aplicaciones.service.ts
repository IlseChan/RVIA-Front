import { Injectable } from '@angular/core';
import { catchError, delay, map, Observable, of, tap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { Aplication, AplicationsData, FormProjectWithPDF, Language } from '../interfaces/aplicaciones.interfaces';
import { environment } from '../../../../environments/environment';
import { token } from '@modules/shared/helpers/getToken';
import { dataPerPage } from '@modules/shared/helpers/dataPerPage';

@Injectable({
  providedIn: 'root'
})
export class AplicacionesService {
  private readonly baseUrl = environment.baseURL;
  private changes: boolean = false;

  allApps: AplicationsData = {
    data: [],
    total: -1 
  }

  constructor(private http: HttpClient){}

  clearDataApps(): void {
    this.allApps.data = [];
    this.allApps.total = -1; 
  }

  getAplicaciones(page: number = 1): Observable<AplicationsData> {
    if((token() && this.allApps.data.length === 0) || (token() && this.changes)){
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
          catchError(e => of({ data: [], total: 0 }))
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
    if(token()){
      const body = { estatusId: newStatus };
      return this.http.patch<Aplication>(`${this.baseUrl}/applications/${app.idu_aplicacion}`,body)
        .pipe(
          delay(1000)
        );
    }

    return throwError(() => {});
  }

  saveGitLabUrl(url: string): Observable<Aplication> {
    if(token()){
      return this.http.post<Aplication>(`${this.baseUrl}/applications/git`,{ url });
    }

    return throwError(() => {});
  }

  saveZipFile(file: File): Observable<Aplication> {
    if(token()){
      const formData = new FormData();
      formData.append('file',file);

      return this.http.post<Aplication>(`${this.baseUrl}/applications/files`,formData);
    }
    
    return throwError(() => {});
  }

  saveProjectWitPDF(form: FormProjectWithPDF): Observable<Aplication> {
    const formData = new FormData();
    
    if(token()){

      formData.append('num_accion',form.action.toString()); 

      if(form.action === 3){
        formData.append('opc_lenguaje',form.language.toString());
      }

      if(form.type === 'zip'){ 
        formData.append('files',form.zipFile!);
        if(form.pdfFile) formData.append('files',form.pdfFile!);
      
        return this.http.post<Aplication>(`${this.baseUrl}/applications/files`,formData)
          .pipe(
            tap(() => this.changes = true)
          );
      }
  
      if(form.type === 'git'){
        formData.append('url',form.urlGit);
        if(form.pdfFile) formData.append('file',form.pdfFile);

        return this.http.post<Aplication>(`${this.baseUrl}/applications/git`,formData)
          .pipe(
            tap(() => this.changes = true)
          );
      }
    }

    return throwError(() => {});
  }

  getLanguages(): Observable<Language[]> {
    if(token()){
      return this.http.get<Language[]>(`${this.baseUrl}/languages`)
      .pipe(
        delay(1000)
      );
    }
    
    return throwError(() => {});
  }

  downloadFile(id: number): Observable<Blob> {
    if(token()){
      return this.http.get(`${this.baseUrl}/applications/zip/${id}`,{ responseType: 'blob' });
    } 
    
    return throwError(() => {});
  }
}