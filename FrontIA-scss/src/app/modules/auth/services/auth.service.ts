import { Injectable } from '@angular/core';
import { UserLogged } from '../interfaces/userLogged.interface';
import { catchError, Observable, of, tap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AplicacionesService } from '@modules/aplicaciones/services/aplicaciones.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl = environment.baseURL;

  private currentUser: UserLogged | null = null;

  constructor(
    private http: HttpClient, 
    private aplicacionesServices: AplicacionesService) { }

  get userLogged(): UserLogged | null {
    return this.currentUser;
    // return {
    //   idu_usuario: 2,
    //   nom_correo: "penta0.miedo@coppel.com",
    //   numero_empleado: 19,
    //   position: {
    //     idu_puesto: 1,
    //     nom_puesto: "Administrador",
    //     //     nom_puesto: "Administrador",
    //     //     // nom_puesto: "Autorizador",
    //     //     // nom_puesto: "Usuario",
    //     //     // nom_puesto: "Invitado",
    //   },
    //   token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNzIxODYwNDAzLCJleHAiOjE3MjE4Njc2MDN9.kze-ZG6Fo8kJsVdnD2Aa-lQhCGFtBVyCvnkb8-qutsI"
    // }
  }

  register(usernumber: string, username: string, password: string, email: string): Observable<void> {
    const idu_puesto = 4; // Asegurar que idu_puesto siempre es 4
    return this.http.post<void>(`${this.baseUrl}/auth/register`, {
      numero_empleado: usernumber,
      nom_usuario: username,
      nom_contrasena: password,
      idu_puesto: idu_puesto,
      nom_correo: email
    })
    .pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    return throwError(error.error || 'Server error');
  }


  getUsers(): { usernumber: string, username: string, password: string }[] {
    return JSON.parse(localStorage.getItem('users') || '[]');
  }

  onLogin(user: string, password: string) {
    // 00000011
    // Aamd230299
    return this.http.post<UserLogged>(`${this.baseUrl}/auth/login`, {
      numero_empleado: user,
      nom_contrasena: password
    })
    .pipe(
      tap(resp => {
        console.log(resp);
        
        this.currentUser = resp;
        localStorage.setItem('token', this.currentUser.token)
      }),
      catchError(e => {
        console.log(e);
        
        return of([])
      })
    )
  }

  onLogout(): void {
    //TODO: Limpiar al usuario y datos según sea necesario
    this.currentUser = null;
    localStorage.removeItem('token');
    this.aplicacionesServices.clearDataApps();
  }
}
