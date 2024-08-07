import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, delay, map, Observable, of, tap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { Aplication, AplicationsData, FormProjectWithPDF, Language } from '../interfaces/aplicaciones.interfaces';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AplicacionesService {
  private readonly baseUrl = environment.baseURL;

  changeListSubject = new BehaviorSubject<boolean>(false);

  allAppsResp: AplicationsData = {
    data: [],
    total: -1 
  }
  elementPerPage: number = 5;

  constructor(private http: HttpClient){}

  get token(): string | null {
    const token = localStorage.getItem('token');
    return token || null;
  }

  clearDataApps(): void {
    this.allAppsResp.data = [];
    this.allAppsResp.total = -1; 
  }

  getAplicaciones(page: number = 1): Observable<AplicationsData> {
    if((this.token && this.allAppsResp.data.length === 0) || (this.token && this.changeListSubject.getValue())){
      return this.http.get<Aplication[]>(`${this.baseUrl}/applications`)
        .pipe(
          tap(apps => {
            this.allAppsResp.data = apps;
            this.allAppsResp.total = apps.length;
            this.changeListSubject.next(false);
          }),
          map(apps => this.getAppsByPage(apps,page)),
          delay(1000),
          catchError(e => of({ data: [], total: 0 }))
        )
      }
      else{
        return of(
          this.getAppsByPage([...this.allAppsResp.data],page)
        )
      }
  }
 
  private getAppsByPage(apps: Aplication[], page: number): AplicationsData {
    const from = (page - 1) * this.elementPerPage;
    const to = from + this.elementPerPage;
    const tmpData = apps.slice(from, to);
    return {
      data: tmpData,
      total: this.allAppsResp.total
    };
  }

  setNewStatus(app: Aplication, newStatus: number): Observable<Aplication> {
    if(this.token){
      const body = { estatusId: newStatus };
      return this.http.patch<Aplication>(`${this.baseUrl}/applications/${app.idu_aplicacion}`,body)
        .pipe(
          delay(1000)
        );
    }

    return throwError(() => {})
  }

  saveGitLabUrl(url: string): Observable<Aplication>{
    if(this.token){
      return this.http.post<Aplication>(`${this.baseUrl}/applications/git`,{ url })
    }

    return throwError(() => {})
  }

  saveZipFile(file: File): Observable<Aplication>{
    if(this.token){
      const formData = new FormData();
      formData.append('file',file);

      return this.http.post<Aplication>(`${this.baseUrl}/applications/files`,formData)
    }
    
    return throwError(() => {})
  }

  saveProjectWitPDF(form: FormProjectWithPDF): Observable<Aplication> {
    const formData = new FormData();
    
    if(this.token){

      formData.append('num_accion',form.action.toString()); 

      if(form.action === 3){
        formData.append('opc_lenguaje',form.language.toString());
      }

      if(form.type === 'zip'){ 
        formData.append('files',form.zipFile!);
        if(form.pdfFile) formData.append('files',form.pdfFile!);
      
        return this.http.post<Aplication>(`${this.baseUrl}/applications/files`,formData);
      }
  
      if(form.type === 'git'){
        formData.append('url',form.urlGit);
        if(form.pdfFile) formData.append('file',form.pdfFile);

        return this.http.post<Aplication>(`${this.baseUrl}/applications/git`,formData);
      }
    }

    return throwError(() => {});
  }

  getLanguages(): Observable<Language[]> {
    if(this.token){
      return this.http.get<Language[]>(`${this.baseUrl}/languages`).pipe(
        delay(1500)
      );
    }
    
    return throwError(() => {})
  }

  downloadFile(id: number): Observable<Blob> {
    if(this.token){
      return this.http.get(`${this.baseUrl}/applications/zip/${id}`,{ responseType: 'blob' });
    } 
    
    return throwError(() => {})
  }
}