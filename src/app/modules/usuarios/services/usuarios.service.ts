import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, delay, map, Observable, of, switchMap, tap, throwError } from 'rxjs';

import { Usuario } from '@modules/shared/interfaces/usuario.interface';
import { UsersData } from '../interfaces/usuarios.interface';
import { environment } from '../../../../environments/environment';
import { token } from '@modules/shared/helpers/getToken';
import { dataPerPage } from '@modules/shared/helpers/dataPerPage';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {  
  private readonly baseUrl = environment.baseURL;
  private changes: boolean = false;
  userEditSubject = new BehaviorSubject<Usuario|null>(null);
  userEdit$: Observable<Usuario|null> = this.userEditSubject.asObservable();

  private allUsers: UsersData = {
    data: [],
    total: -1 
  }

  constructor(private http: HttpClient){}

  clearDataUsers(): void {
    this.allUsers.data = [];
    this.allUsers.total = -1;
  }

  getUsuarios(page: number = 1): Observable<UsersData> {
    if((token() && this.allUsers.data.length === 0) || (token() && this.changes)){
      return this.http.get<Usuario[]>(`${this.baseUrl}/auth`)
        .pipe(
          tap(users => {
            this.allUsers.data = users;
            this.allUsers.total = users.length;
            this.changes = false;
          }),
          map(users => {
            return {
              data: dataPerPage([...users],page) as Usuario[],
              total: this.allUsers.total
            }
          } )
        )
    }else{
      return of(
        {
          data: dataPerPage([...this.allUsers.data],page) as Usuario[],
          total: this.allUsers.total
        }
      )
    }
  }

  setUserToEdit(id: number): void {
    const user = this.allUsers.data.find(user => user.idu_usuario === id);
    this.userEditSubject.next(user ? user : null);
  }

  getUsuarioById(id: number): Observable<Usuario> {
    if(token()){
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
    if(token()){
      return this.http.patch<Usuario>(`${this.baseUrl}/auth/${originalUser.idu_usuario}`,changes)
        .pipe(
          tap(() => this.changes = true),
          delay(1000)
        )
    }

    return throwError(() => {});
  }

  deleteUsuario(id: number): Observable<Usuario> {
    if(token()){
      return this.http.delete<Usuario>(`${this.baseUrl}/auth/${id}`)
        .pipe(
          tap(() => this.changes = true),
          delay(1000)
        )
    }

    return throwError(() => {});
  }
}