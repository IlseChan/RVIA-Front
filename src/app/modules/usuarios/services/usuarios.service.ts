import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, delay, map, Observable, of, switchMap, tap, throwError } from 'rxjs';

import { Usuario } from '@modules/shared/interfaces/usuario.interface';
import { UsersData } from '../interfaces/usuarios.interface';
import { environment } from '../../../../environments/environment';
import { token } from '@modules/shared/helpers/getToken';
import { dataPerPage } from '@modules/shared/helpers/dataPerPage';
import { NotificationsService } from '@modules/shared/services/notifications.service';

enum OriginMethod {
  DELETEUSERS = 'DELETEUSERS',
  GETUSER = 'GETUSER',
  GETUSERS = 'GETUSERS',
  UPDATEUSER = 'UPDATEUSER' 
}

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
          }),
          catchError(error => this.handleError(error, OriginMethod.GETUSERS))
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
        }),
        catchError(error => this.handleError(error, OriginMethod.GETUSER))
      );
    }

    return this.handleError(new Error('No Token'),OriginMethod.GETUSER,id);
  }

  updateUsuario(originalUser: Usuario,changes: Usuario): Observable<Usuario> {
    if(token()){
      return this.http.patch<Usuario>(`${this.baseUrl}/auth/${originalUser.idu_usuario}`,changes)
        .pipe(
          tap(() => this.changes = true),
          tap((resp) => {
            const title = 'Actualización Exitosa';
            const content = `El usuario ${resp.numero_empleado} - ${resp.nom_usuario} con posición ${resp.position.nom_puesto} se actualizó correctamente`
            this.notificationsService.successMessage(title,content);
          }),
          delay(1000),
          catchError(error => this.handleError(error, OriginMethod.UPDATEUSER,originalUser.nom_usuario))
        );
    }

    return this.handleError(new Error('No Token'),OriginMethod.UPDATEUSER,originalUser.nom_usuario);
  }

  deleteUsuario(user: Usuario): Observable<Usuario> {
    if(token()){
      return this.http.delete<Usuario>(`${this.baseUrl}/auth/${user.idu_usuario}`)
        .pipe(
          tap(() => this.changes = true),
          tap(() => {
            const title = 'Usuario eliminado';
            const content = `El usuario ${user.nom_usuario} se elimino correctamente.`
            this.notificationsService.successMessage(title,content);
          }),
          delay(1000),
          catchError(error => this.handleError(error, OriginMethod.DELETEUSERS,user.nom_usuario))
        );
    }

    return this.handleError(new Error('No Token'),OriginMethod.DELETEUSERS,user.nom_usuario);
  }

  handleError(error: Error, origin: OriginMethod, extra?: string | number) {
    const title = 'Error';
    
    const errorsMessages = {
      DELETEUSERS: `Error al eliminar al usuario ${extra}`,
      GETUSER: 'Error al cargar información', 
      GETUSERS: 'Error al obtener los usuarios, intenta de nuevo',
      UPDATEUSER: `Error al actualizar al usaurio ${extra}`
    };

    this.notificationsService.errorMessage(title,errorsMessages[origin]);
    return throwError(() => 'ERROR ERROR ERROR');
  }
}