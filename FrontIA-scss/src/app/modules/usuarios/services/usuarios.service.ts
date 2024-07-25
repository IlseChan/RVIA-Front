import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, delay, map, Observable, of, switchMap, tap, throwError } from 'rxjs';

import { Usuario, UsersData } from '../interfaces/usuario.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {  
  private readonly baseUrl = environment.baseURL;
  private userEditSubject = new BehaviorSubject<Usuario|null>(null);
  userEdit$: Observable<Usuario|null> = this.userEditSubject.asObservable();

  private allUsers: UsersData = {
    data: [],
    total: -1 
  }
  private changes: boolean = false;

  constructor(private http: HttpClient){}

  getUsuarios(page: number = 1): Observable<UsersData> {
    
    const token = localStorage.getItem('token');
    
    if((token && this.allUsers.data.length === 0 || this.changes)){
      const headerOpc = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        })
      };
      
      return this.http.get<Usuario[]>(`${this.baseUrl}/auth`,headerOpc)
        .pipe(
          tap((r) => {
            this.allUsers.data = r;
            this.allUsers.total = r.length;
            this.changes = false;
          }),
          map(users => {
            return {
              data: this.getUserByPage(page),
              total: users.length 
            }
          })
        )
    }else{
      const data = this.getUserByPage(page);
      return of({
        data,
        total: this.allUsers.total
      })
    }
  }

  private getUserByPage(page: number): Usuario[]{
    const from = ( page -1 ) * 5;
    const to = from + 5;
    return this.allUsers.data.slice(from,to);
  }

  setUserToEdit(id: number){
    const user = this.allUsers.data.find(user => user.idu_usuario === id);
    this.userEditSubject.next(user ? user : null);
  }

  getUsuarioById(id: number): Observable<Usuario>{

    const token = localStorage.getItem('token');
    if(token){
      return this.userEdit$.pipe(
        switchMap( user => {
          
          if(user && user.idu_usuario === id){
            return of(user);
          } else{
            const headerOpc = {
              headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              })
            };            
            return this.http.get<Usuario>(`${this.baseUrl}/auth/${id}`,headerOpc)
          }
        })
      );
    }

    return throwError(() => {});
  }

  updateUsuario(originalUser: Usuario,changes: Usuario): Observable<Usuario>{
    const token = localStorage.getItem('token');
  
    if(token){
      const headerOpc = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        })
      };
      
      return this.http.patch<Usuario>(`${this.baseUrl}/auth/${originalUser.idu_usuario}`,changes,headerOpc)
        .pipe(
          tap(() => this.changes = true),
          tap(() => this.userEditSubject.next(null)),
          delay(1000)
        )
    }

    return throwError(() => {});
  }

  deleteUsuario(id: number){
    
    const token = localStorage.getItem('token');
  
    if(token){
      const headerOpc = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        })
      };

      return this.http.delete(`${this.baseUrl}/auth/${id}`,headerOpc)
        .pipe(
          tap(() => this.changes = true),
          delay(2000)
        )
    }

    return throwError(() => {});
  }

}
