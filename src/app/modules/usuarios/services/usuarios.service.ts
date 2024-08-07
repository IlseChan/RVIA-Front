import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, delay, map, Observable, of, switchMap, tap, throwError } from 'rxjs';

import { Usuario } from '@modules/shared/interfaces/usuario.interface';
import { UsersData } from '../interfaces/usuarios.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {  
  private readonly baseUrl = environment.baseURL;
  userEditSubject = new BehaviorSubject<Usuario|null>(null);
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

  clearDataUsers():void {
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
          map(users =>  this.getUserByPage(users,page))
        )
    }else{
      return of(
        this.getUserByPage([...this.allUsers.data],page))
    }
  }

  private getUserByPage(users: Usuario[], page: number): UsersData {
    const from = ( page -1 ) * 5;
    const to = from + 5;

    return {
      data: users.slice(from, to),
      total: this.allUsers.total
    }
  }

  setUserToEdit(id: number): void {
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

  updateUsuario(originalUser: Usuario,changes: Usuario): Observable<Usuario> {
    if(this.token){
      return this.http.patch<Usuario>(`${this.baseUrl}/auth/${originalUser.idu_usuario}`,changes)
        .pipe(
          tap(() => this.changes = true),
          delay(1000)
        )
    }

    return throwError(() => {});
  }

  deleteUsuario(id: number): Observable<Usuario> {
    if(this.token){
      return this.http.delete<Usuario>(`${this.baseUrl}/auth/${id}`)
        .pipe(
          tap(() => this.changes = true),
          delay(2000)
        )
    }

    return throwError(() => {});
  }
}
