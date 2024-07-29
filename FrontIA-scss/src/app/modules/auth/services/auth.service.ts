import { Injectable } from '@angular/core';
import { UserLogged } from '../interfaces/userLogged.interface';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
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
  }

  register(usernumber: string, username: string, password: string, email: string): Observable<UserLogged> {
    const idu_puesto = 4;
    return this.http.post<UserLogged>(`${this.baseUrl}/auth/register`, {
      numero_empleado: usernumber,
      nom_usuario: username,
      nom_contrasena: password,
      idu_puesto: idu_puesto,
      nom_correo: email
    })
    .pipe( 
      tap(resp => { 
        console.log(resp);
        
        this.currentUser = resp;
        localStorage.setItem('token', this.currentUser.token)
    }),
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
    return this.http.post<UserLogged>(`${this.baseUrl}/auth/login`, {
      numero_empleado: user,
      nom_contrasena: password
    })
    .pipe(
      tap(resp => {        
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
    this.currentUser = null;
    localStorage.removeItem('token');
    this.aplicacionesServices.clearDataApps();
  }

  tokenValidation(): Observable<boolean> {
    return this.http.get<UserLogged>(`${this.baseUrl}/auth/check-status`)
    .pipe(
      map((resp) => {
        if(resp){
          this.currentUser = resp;
          localStorage.setItem('token', this.currentUser.token)
          return true;
        }
        return false;
      }),
      catchError(() => of(false))
    )
  }
}
