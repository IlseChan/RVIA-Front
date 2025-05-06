import { computed, Injectable, signal } from '@angular/core';
import { catchError, delay, map, Observable, of, tap, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { environment } from '../../../../environments/environment';
import { AplicacionesService } from '@modules/aplicaciones/services/aplicaciones.service';
import { UsuariosService } from '@modules/usuarios/services/usuarios.service';
import { NotificationsService } from '@modules/shared/services/notifications.service';
import { Idu_Rol, Usuario } from '@modules/usuarios/interfaces';
import { DataToRegister, InfoOrg, OriginMethod, Position } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl = environment.baseURL;
  private currentUser: Usuario | null = null;

  private _user = signal<Usuario | null>(null);  
  user =  computed(() => this._user());

  fullName = computed(() => {
    if(!this._user()) return 'Error'
    
    const { nom_usuario } = this._user()!;
    const name = nom_usuario.split(' '); 
    
    return `${name[0]} ${name.at(-2)}`;
  });

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
      tap((user) => this._user.set(user)),
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
      tap((user) => this._user.set(user)),
      delay(1000),
      tap(() => this.router.navigate(['/apps/list-apps'])),
      catchError(e => throwError(() => e))
    )
  }

  logoutUser(): void {
    this.currentUser = null;
    this._user.set(null);
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
          this._user.set(resp);
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
    return this.http.get<Position[]>(`${this.baseUrl}/positions`)
    .pipe(
      catchError(error => this.handleErrorMess(error, OriginMethod.GETPOSITIONS))
    )
  }

  getInfoOrg(idu_puesto: number): Observable<InfoOrg> {
    return this.http.get<InfoOrg>(`${this.baseUrl}/leader/${idu_puesto}`)
    .pipe(
      catchError(error => this.handleErrorMess(error, OriginMethod.GETINFOORG))
    )
  }

  private handleErrorMess(error: HttpErrorResponse, origin: OriginMethod, extra?: string | number) {
    // console.log(error);
    const title = 'Error';
    if(error.status === 0){
      const errorMessage = 'No es posible conectar con el servidor, intentelo más tarde o contacte con el administrador.'
      this.notificationsService.errorMessage(title,errorMessage);

    }else if(error.status !== 401){
      const errorsMessages = {
        GETINFOORG: `Error al obtener información de aplicaciones, centros y encargados. Intentar más tarde.`,
        GETPOSITIONS: `Error al obtener los puestos. Intentar más tarde.`,
        POSTREGISTER: `Error al registrar nuevo cuenta. Intentar más tarde.`,
      };

      this.notificationsService.errorMessage(title,errorsMessages[origin]);
    }
  
    return throwError(() => 'ERROR ERROR ERROR');
  }
}