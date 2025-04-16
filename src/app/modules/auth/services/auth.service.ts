import { Injectable } from '@angular/core';
import { catchError, delay, map, Observable, of, tap, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { environment } from '../../../../environments/environment';
import { AplicacionesService } from '@modules/aplicaciones/services/aplicaciones.service';
import { UsuariosService } from '@modules/usuarios/services/usuarios.service';
import { NotificationsService } from '@modules/shared/services/notifications.service';
import { Router } from '@angular/router';
import { Idu_Rol, Usuario } from '@modules/usuarios/interfaces';
import { DataToRegister, OriginMethod, Position } from '../interfaces';

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

  registerUser(data: DataToRegister): Observable<Usuario> {
    const idu_rol = Idu_Rol.INVITADO; 
    return this.http.post<Usuario>(`${this.baseUrl}/auth/register`, {
      ...data,
      idu_rol,
    })
    .pipe( 
      tap(user => {
        this.currentUser = user;
        if(this.currentUser.token)
          localStorage.setItem('token', this.currentUser.token)
      }),
      tap(user => {
        const title = 'Registró exitoso';
        const content = `¡Se ha registrado exitosamente el usuario ${user.num_empleado}!`
        this.notificationsService.successMessage(title,content);
      }),
      tap(() => this.router.navigate(['/apps/list-apps'])),
      catchError((error) => this.handleErrorMess(error, OriginMethod.POSTREGISTER))
    );
  }

  loginUser(num_empleado: string, nom_contrasena: string): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.baseUrl}/auth/login`, {
      num_empleado,
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

  getPositions(): Observable<Position[]>{
    const positions = [
      {
        idu_puesto: 1,
        nom_puesto: 'Divisional'
      },
      {
        idu_puesto: 2,
        nom_puesto: 'Nacional'
      },
      {
        idu_puesto: 3,
        nom_puesto: 'Coordinador'
      },
      {
        idu_puesto: 4,
        nom_puesto: 'gerente'
      },
      {
        idu_puesto: 5,
        nom_puesto: 'Colaborador'
      },
    ]
    
    return of(positions);

    // return this.http.get<Position[]>(`${this.baseUrl}/auth/pos`)
    // .pipe(
    //   catchError(error => this.handleErrorMess(error, OriginMethod.GETPOSITIONS))
    // )
  }

  private handleError(error: any): Observable<never> {
    return throwError(error.error || 'Server error');
  }

  private handleErrorMess(error: HttpErrorResponse, origin: OriginMethod, extra?: string | number) {
    console.log(error);
    const title = 'Error';
    if(error.status === 0){
      const errorMessage = 'No es posible conectar con el servidor, intentelo más tarde o contacte con el administrador.'
      this.notificationsService.errorMessage(title,errorMessage);
    }else if(error.status !== 401){
      const errorsMessages = {
        GETPOSITIONS: `Error al obtener los puestos. Intentar más tarde.`,
        POSTREGISTER: `Error al Registrar. Intentar más tarde.`,
      };

      this.notificationsService.errorMessage(title,errorsMessages[origin]);
    }
  
    return throwError(() => 'ERROR ERROR ERROR');
  }
}