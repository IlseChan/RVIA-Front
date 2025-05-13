import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, delay, map, Observable, of, tap, throwError } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { NotificationsService } from '@modules/shared/services/notifications.service';
import { FormNewPassword, OriginMethod, UsersData, Usuario, UsuarioCmplt } from '../interfaces';
import { InfoOrg, Position } from '@modules/auth/interfaces';
import { Manager, RespManagers } from '../interfaces/respManagers.interface';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {  
  private readonly baseUrl = environment.baseURL;
  private http = inject(HttpClient);
  private notificationsService = inject(NotificationsService);

  private changes: boolean = false;
  userToEdit = signal<Usuario|null>(null);

  private allUsers: UsersData = {
    data: [],
    total: -1 
  }

  cachePositions = signal<Position[]>([]);
  cacheInfoOrg = signal<InfoOrg>({
      aplicaciones: [],
      centros: [],
      superiores: [],
    });
  private cacheManagers = new Map<Number, Manager[]>();
  
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
    this.userToEdit.set(user ? user : null);
  }

  getUsuarioById(id: number): Observable<UsuarioCmplt> {
    return this.http.get<UsuarioCmplt>(`${this.baseUrl}/auth/${id}`).pipe(
      tap(user => this.userToEdit.set(user)),
      catchError(error => this.handleError(error, OriginMethod.GETUSER,id))
    )
  }

  updateUsuario(originalUser: Usuario,changes: Usuario): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.baseUrl}/auth/${originalUser.idu_usuario}`,changes)
      .pipe(
        tap(() => this.changes = true),
        tap((resp) => {
          const title = 'Actualización Exitosa';
          const content = `El usuario ${resp.num_empleado} - ${resp.nom_usuario} con posición ${resp.position.nom_rol} se actualizó correctamente.`
          this.notificationsService.successMessage(title,content);
        }),
        delay(1200),
        tap(() =>  this.userToEdit.set(null)),
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

  getPositions(): Observable<Position[]>{    
    if(this.cachePositions().length > 0){
      return of(this.cachePositions());
    }

    return this.http.get<Position[]>(`${this.baseUrl}/positions`)
      .pipe(
        tap(positions => this.cachePositions.set(positions)),
        catchError(error => this.handleError(error, OriginMethod.GETPOSITIONS))
      )
  }

  getInfoOrg(idu_puesto: number): Observable<InfoOrg> {
    if(this.cacheInfoOrg().aplicaciones.length > 0){
      return of(this.cacheInfoOrg());
    }

    return this.http.get<InfoOrg>(`${this.baseUrl}/leader/${idu_puesto}`)
    .pipe(
      tap(infoOrg => this.cacheInfoOrg.set(infoOrg)),
      catchError(error => this.handleError(error, OriginMethod.GETINFOORG))
    )
  }

  getManagers(idu_puesto: number): Observable<RespManagers> {    
    if (this.cacheManagers.has(idu_puesto)) {
      const encargados = this.cacheManagers.get(idu_puesto)!;
      this.cacheInfoOrg.update(infoOrg => {
        return {
          ...infoOrg,
          superiores: encargados
        }
      })
      return of({encargados: []});
    }

    return this.http.get<RespManagers>(`${this.baseUrl}/leader/puesto/${idu_puesto}`)
    .pipe(
      tap(({ encargados }) => {
        this.cacheInfoOrg.update(infoOrg => {
          return {
            ...infoOrg,
            superiores: [...encargados]
          }
        })
      }),
      tap(({ encargados }) => this.cacheManagers.set(idu_puesto, encargados)),
      catchError(error => this.handleError(error, OriginMethod.GETMANAGER))
    )
  }

  changePassword(changes: FormNewPassword): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.baseUrl}/auth/change-password`,changes)
      .pipe(
        tap(() => {
          const title = 'Actualización Exitosa';
          const content = `¡Contraseña actualizada! Úsala la próxima vez que inicies sesión.`
          this.notificationsService.successMessage(title,content,5000);
        }),
        delay(1000),
        catchError(error => this.handleError(error, OriginMethod.POSTPASSWORD))
      );
  }

  handleError(error: HttpErrorResponse, origin: OriginMethod, extra?: string | number) {
    if(error.status !== 401){
      const title = 'Error';
      const errorsMessages = {
        DELETEUSERS: `Error al eliminar al usuario ${extra}.`,
        GETUSER: `Error al cargar información. Usuario id: ${extra}.`, 
        GETUSERS: 'Error al obtener los usuarios, inténtalo más tarde.',
        UPDATEUSER: `Error al actualizar al usuario ${extra}`,
        GETPOSITIONS: 'Error al obtener las posiciones, inténtalo más tarde.',
        GETINFOORG: 'Error al obtener información de aplicaciones, centros y encargados. Intentar más tarde.',
        GETMANAGER: 'Error al obtener los encargados, inténtalo más tarde.',
        POSTPASSWORD: `Error al cambiar la contraseña, inténtalo más tarde. ${error?.error?.message}`,
      };
      this.notificationsService.errorMessage(title,errorsMessages[origin],5000);
    }

    return throwError(() => 'ERROR ERROR ERROR');
  }
}