import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, delay, map, Observable, of, switchMap, tap, throwError } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { dataPerPage } from '@modules/shared/helpers/dataPerPage';
import { NotificationsService } from '@modules/shared/services/notifications.service';
import { OriginMethod, UsersData, Usuario } from '../interfaces';

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

  constructor(
    private http: HttpClient,
    private notificationsService: NotificationsService
  ){}

  clearDataUsers(): void {
    this.allUsers.data = [];
    this.allUsers.total = -1;
  }

  getUsuarios(): Observable<UsersData> {
    if(this.allUsers.data.length === 0 || this.changes){
      return this.http.get<Usuario[]>(`${this.baseUrl}/auth`)
        .pipe(
          tap(users => {
            this.allUsers.data = users;
            this.allUsers.total = users.length;
            this.changes = false;
          }),
          map(() => ({...this.allUsers})),
          delay(1000),
          catchError(error => this.handleError(error, OriginMethod.GETUSERS))
        )
    }else{
      return of({...this.allUsers})
    }
  }

  setUserToEdit(id: number): void {
    const user = this.allUsers.data.find(user => user.idu_usuario === id);
    this.userEditSubject.next(user ? user : null);
  }

  getUsuarioById(id: number): Observable<Usuario> {
    return this.userEdit$.pipe(
      switchMap( user => {        
        if(user && user.idu_usuario === id){
          return of(user);
        }
        return this.http.get<Usuario>(`${this.baseUrl}/auth/${id}`)
      }),
      catchError(error => this.handleError(error, OriginMethod.GETUSER,id))
    );
  }

  updateUsuario(originalUser: Usuario,changes: Usuario): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.baseUrl}/auth/${originalUser.idu_usuario}`,changes)
      .pipe(
        tap(() => this.changes = true),
        tap((resp) => {
          const title = 'Actualización Exitosa';
          const content = `El usuario ${resp.numero_empleado} - ${resp.nom_usuario} con posición 
            ${resp.position.nom_rol} se actualizó correctamente.`
          this.notificationsService.successMessage(title,content);
        }),
        tap(() =>  this.userEditSubject.next(null)),
        catchError(error => this.handleError(error, OriginMethod.UPDATEUSER,originalUser.nom_usuario))
      );
  }

  deleteUsuario(user: Usuario): Observable<Usuario> {
    return this.http.delete<Usuario>(`${this.baseUrl}/auth/${user.idu_usuario}`)
      .pipe(
        tap(() => this.changes = true),
        tap(() => {
          const title = 'Usuario eliminado';
          const content = `El usuario ${user.nom_usuario} se eliminó correctamente.`
          this.notificationsService.successMessage(title,content);
        }),
        delay(1000),
        catchError(error => this.handleError(error, OriginMethod.DELETEUSERS,user.nom_usuario))
      );
  }

  handleError(error: Error, origin: OriginMethod, extra?: string | number) {
    const title = 'Error';
    
    const errorsMessages = {
      DELETEUSERS: `Error al eliminar al usuario ${extra}.`,
      GETUSER: `Error al cargar información. Usuario id: ${extra}.`, 
      GETUSERS: 'Error al obtener los usuarios, inténtalo más tarde.',
      UPDATEUSER: `Error al actualizar al usuario ${extra}`
    };

    this.notificationsService.errorMessage(title,errorsMessages[origin]);
    return throwError(() => 'ERROR ERROR ERROR');
  }
}