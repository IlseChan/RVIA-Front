import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  get token(): string | null {
    const token = localStorage.getItem('token');
    return token || null;
  }

  clearDataUsers():void{
    this.allUsers.data = [];
    this.allUsers.total = -1;
  }

  getUsuarios(page: number = 1): Observable<UsersData> {
    if((this.token && this.allUsers.data.length === 0 || this.changes)){
      return this.http.get<Usuario[]>(`${this.baseUrl}/auth`)
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
    if(this.token){
      return this.userEdit$.pipe(
        switchMap( user => {
          
          if(user && user.idu_usuario === id){
            return of(user);
          }

          return this.http.get<Usuario>(`${this.baseUrl}/auth/${id}`)
        })
      );
    }

    return throwError(() => {});
  }

  updateUsuario(originalUser: Usuario,changes: Usuario): Observable<Usuario>{
    if(this.token){
      return this.http.patch<Usuario>(`${this.baseUrl}/auth/${originalUser.idu_usuario}`,changes)
        .pipe(
          tap(() => this.changes = true),
          tap(() => this.userEditSubject.next(null)),
          delay(1000)
        )
    }

    return throwError(() => {});
  }

  deleteUsuario(id: number){
    if(this.token){
      return this.http.delete(`${this.baseUrl}/auth/${id}`)
        .pipe(
          tap(() => this.changes = true),
          delay(2000)
        )
    }

    return throwError(() => {});
  }

}
