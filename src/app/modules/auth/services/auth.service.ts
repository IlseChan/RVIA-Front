import { Injectable } from '@angular/core';
import { catchError, delay, map, Observable, of, tap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../environments/environment';
import { AplicacionesService } from '@modules/aplicaciones/services/aplicaciones.service';
import { UsuariosService } from '@modules/usuarios/services/usuarios.service';
import { Idu_Rol, Usuario } from '@modules/shared/interfaces/usuario.interface';
import { NotificationsService } from '@modules/shared/services/notifications.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl = environment.baseURL;
  private currentUser: Usuario | null = null;

  constructor(
    private http: HttpClient, 
    private aplicacionesServices: AplicacionesService,
    private usuariosService: UsuariosService,
    private notificationsService: NotificationsService,
    private router: Router
  ) {}

  get userLogged(): Usuario | null {
    return this.currentUser;
  }

  registerUser(numero_empleado: string, nom_usuario: string, nom_contrasena: string, nom_correo: string): Observable<Usuario> {
    const idu_rol = Idu_Rol.INVITADO; 
    return this.http.post<Usuario>(`${this.baseUrl}/auth/register`, {
      numero_empleado,
      nom_usuario,
      nom_contrasena,
      idu_rol,
      nom_correo
    })
    .pipe( 
      tap(user => { 
        this.currentUser = user;
        if(this.currentUser.token)
          localStorage.setItem('token', this.currentUser.token)
      }),
      tap(user => {
        const title = 'Registro exitoso';
        const content = `¡Se ha registrado exitosamente el usuario ${user.numero_empleado}!  Será redirigido en un momento`
        this.notificationsService.successMessage(title,content);
      }),
      delay(2000),
      tap(() => this.router.navigate(['/apps/list-apps'])),
      catchError(this.handleError)
    );
  }

  loginUser(numero_empleado: string, nom_contrasena: string): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.baseUrl}/auth/login`, {
      numero_empleado,
      nom_contrasena
    })
    .pipe(
      tap(user => {        
        this.currentUser = user;
        if(this.currentUser.token)
          localStorage.setItem('token', this.currentUser.token)
      }),
      delay(1000),
      tap(() => this.router.navigate(['/apps/list-apps'])),
      catchError(e => throwError(() => e))
    )
  }

  logoutUser(): void {
    this.currentUser = null;
    localStorage.removeItem('token');
    this.aplicacionesServices.clearDataApps();
    this.usuariosService.clearDataUsers();
  }

  tokenValidation(): Observable<boolean> {
    return this.http.get<Usuario>(`${this.baseUrl}/auth/check-status`)
    .pipe(
      map((resp) => {
        if(resp){
          this.currentUser = resp;
          if(this.currentUser.token)
            localStorage.setItem('token', this.currentUser.token)
          return true;
        }
        return false;
      }),
      catchError(() => of(false))
    )
  }

  private handleError(error: any): Observable<never> {
    return throwError(error.error || 'Server error');
  }
}