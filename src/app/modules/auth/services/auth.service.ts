import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../environments/environment';
import { AplicacionesService } from '@modules/aplicaciones/services/aplicaciones.service';
import { UsuariosService } from '@modules/usuarios/services/usuarios.service';
import { Usuario } from '@modules/shared/interfaces/usuario.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl = environment.baseURL;
  private currentUser: Usuario | null = null;

  constructor(
    private http: HttpClient, 
    private aplicacionesServices: AplicacionesService,
    private usuariosService: UsuariosService
  ) { }

  get userLogged(): Usuario | null {
    return this.currentUser;
  }

  register(usernumber: string, username: string, password: string, email: string): Observable<Usuario> {
    const idu_puesto = 4;
    return this.http.post<Usuario>(`${this.baseUrl}/auth/register`, {
      numero_empleado: usernumber,
      nom_usuario: username,
      nom_contrasena: password,
      idu_puesto: idu_puesto,
      nom_correo: email
    })
    .pipe( 
      tap(resp => { 
        this.currentUser = resp;
        if(this.currentUser.token)
          localStorage.setItem('token', this.currentUser.token)
    }),
    catchError(this.handleError)
    );
  }

  onLogin(user: string, password: string): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.baseUrl}/auth/login`, {
      numero_empleado: user,
      nom_contrasena: password
    })
    .pipe(
      tap(resp => {        
        this.currentUser = resp;
        if(this.currentUser.token)
          localStorage.setItem('token', this.currentUser.token)
      }),
      map(resp => resp as Usuario), // Asegurar que la respuesta es del tipo UserLogged
      catchError(e => {
        console.log(e);
        return throwError(() => new Error('Login failed')); // Retornar un error en lugar de un array vacío
      })
    )
  }

  onLogout(): void {
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