import { Injectable } from '@angular/core';
import { catchError, delay, map, Observable, of, tap } from 'rxjs';
import { Aplication, AplicationsData } from '../interfaces/aplicaciones.interfaces';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AplicacionesService {
  private readonly baseUrl = environment.baseURL;

  allAppsResp: AplicationsData = {
    data: [],
    total: -1 
  }

  constructor(private http: HttpClient){}

  getAplicaciones(page: number = 1): Observable<AplicationsData> {
   
    const token = localStorage.getItem('token');
    
    if(token && this.allAppsResp.data.length === 0){
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

  setNewStatus(app: Aplication, newStatus: number): Observable<Aplication | null> {
    
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
          delay(1000),
          catchError(e => {    
            return of(null)
          })
        );
    }

    return of(null)
  }

  saveGitLabUrl(url: string): Observable<Aplication | null>{

    const token = localStorage.getItem('token');

    if(token){
      const headerOpc = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        })
      };
    
      return this.http.post<Aplication>(`${this.baseUrl}/applications/git`,{ url },headerOpc)
        .pipe(
          catchError(e => {
            return of(null)
          })
        );
    }

    return of(null)
  }

  saveZipFile(file: File): Observable<Aplication | null>{

    const token = localStorage.getItem('token');
    
    if(token){
      
      const formData = new FormData();
      formData.append('file',file);
      
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
      });

      return this.http.post<Aplication>(`${this.baseUrl}/applications/files`,formData,{ headers })
        .pipe(
          catchError(e => {
            return of(null)
          })
        )
    }
    
    return of(null)
  }

}
