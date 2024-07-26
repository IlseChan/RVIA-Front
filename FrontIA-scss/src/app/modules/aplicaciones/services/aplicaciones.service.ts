import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, delay, map, Observable, of, tap, throwError } from 'rxjs';
import { Aplication, AplicationsData } from '../interfaces/aplicaciones.interfaces';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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

  constructor(private http: HttpClient){}

  clearDataApps(): void{
    this.allAppsResp.data = [];
    this.allAppsResp.total = -1; 
  }

  getAplicaciones(page: number = 1): Observable<AplicationsData> {
   
    const token = localStorage.getItem('token');
    
    if((token && this.allAppsResp.data.length === 0) || (token && this.changeListSubject.getValue())){
      
      const headerOpc = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        })
      };
      return this.http.get<Aplication[]>(`${this.baseUrl}/applications`,headerOpc)
        .pipe(
          tap(apps => {
            this.allAppsResp.data = apps;
            this.allAppsResp.total = apps.length;
            this.changeListSubject.next(false);
          }),
          map(apps => {
            const from = ( page - 1 ) * 5;
            const to = from + 5;
            const tmpData = [...apps.slice(from,to)];

            return {
              data: tmpData,
              total: apps.length 
            };
          }),
          delay(1000),
          catchError(e => {
            return of({
              data: [],
              total: 0
            })
          })
        )
      }
      else{
        const from = ( page - 1 ) * 5;
        const to = from + 5;
        
        const tmpData = [...this.allAppsResp.data.slice(from,to)];
        return of({
          data: tmpData,
          total: this.allAppsResp.total
        });
      }
  }

  setNewStatus(app: Aplication, newStatus: number): Observable<Aplication> {
    
    const token = localStorage.getItem('token');

    if(token){
      const headerOpc = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        })
      };

      const body = { estatusId: newStatus };
    
      return this.http.patch<Aplication>(`${this.baseUrl}/applications/${app.idu_aplicacion}`,body,headerOpc)
        .pipe(
          delay(1000)
        );
    }

    return throwError(() => {})
  }

  saveGitLabUrl(url: string): Observable<Aplication>{

    const token = localStorage.getItem('token');

    if(token){
      const headerOpc = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        })
      };
    
      return this.http.post<Aplication>(`${this.baseUrl}/applications/git`,{ url },headerOpc)
    }

    return throwError(() => {})
  }

  saveZipFile(file: File): Observable<Aplication>{

    const token = localStorage.getItem('token');
    
    if(token){
      
      const formData = new FormData();
      formData.append('file',file);
      
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
      });

      return this.http.post<Aplication>(`${this.baseUrl}/applications/files`,formData,{ headers })
    }
    
    return throwError(() => {})
  }

}
