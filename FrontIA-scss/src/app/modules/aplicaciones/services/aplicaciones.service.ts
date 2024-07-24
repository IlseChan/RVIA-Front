import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { Aplication } from '../interfaces/aplicaciones.interfaces';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AplicacionesService {

  allAppsResp: { 
    data: Aplication[];
    total: number
  } = {
    data: [],
    total: -1 
  }

  constructor(private http: HttpClient){}

  getAplicaciones(page: number = 1): Observable<any> {
   
    const token = localStorage.getItem('token');
    
    if(token && this.allAppsResp.data.length === 0){
      console.log(token);
      
      const headerOpc = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        })
      };
      return this.http.get<Aplication[]>('http://localhost:3000/applications',headerOpc)
        .pipe(
          tap(apps => {
            this.allAppsResp.data = apps;
            this.allAppsResp.total = apps.length;
          }),
          map(apps => {
            const from = ( page - 1 ) * 5;
            const to = from + 5;
            const tmpData = [...apps.slice(from,to)];
            console.log(apps.length);
            
            return {
              data: tmpData,
              total: apps.length 
            };
          }),
          catchError(e => {
            console.log(e);
            
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
    
      return this.http.patch<Aplication>(`http://localhost:3000/applications/${app.idu_aplicacion}`,body,headerOpc)
        .pipe(
          catchError(e => {
            console.log(e);
            
            return of(null)
          })
        );
    }

    return of(null)
  }

  saveGitLabUrl(url: string){

    const token = localStorage.getItem('token');

    if(token){
      const headerOpc = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        })
      };

      console.log(token);
      
      const body = { url };
    
      return this.http.post(`http://localhost:3000/applications/git`,body,headerOpc)
        .pipe(
          tap(resp => {
            console.log(resp);
            
          }),
          catchError(e => {
            console.log(e);
            
            return of(null)
          })
        );
    }

    return of(null)
  }

  saveZipFile(file: File, name: string) {

    const token = localStorage.getItem('token');

    if(token){
      const headerOpc = {
        headers: new HttpHeaders({
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        })
      };

      
      const formData = new FormData();
      formData.append('file',file);

      console.log(formData);
      // const body = {
      //   file
      // }      
    
      return this.http.post(`http://localhost:3000/applications/files`,file,headerOpc)
        .pipe(
          tap(resp => {
            console.log(resp);
            
          }),
          catchError(e => {
            console.log(e);
            
            return of(null)
          })
        );
    }

    return of(null)
    

  }

}
