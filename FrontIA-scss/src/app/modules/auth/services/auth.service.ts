import { Injectable } from '@angular/core';
import { UserLogged } from '../interfaces/userLogged.interface';
import { catchError, of, tap } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: UserLogged | null = null;

  constructor(private http: HttpClient) { }

  get userLogged(): UserLogged | null {
    return {
      idu_usuario: 1,
      nom_correo: "angel.magan@coppel.com",
      numero_empleado: 11,
      position: {
        idu_puesto: 1,
        nom_puesto: "Administrador",
        // nom_puesto: "Autorizador",
        // nom_puesto: "Usuario",
        // nom_puesto: "Invitado",
      },
      // token: ''
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzIxNzg5Mzk1LCJleHAiOjE3MjE3OTY1OTV9.CoEz3Qds47pU6c-HbZXY0isnfOIcO0DaOXHIfCS8aLU"
    }
  }

  register(usernumber: string, username: string, password: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const users = JSON.parse(localStorage.getItem('users') || '[]');

      if (users.find((user: any) => user.usernumber === usernumber)) {
        reject(new Error('El número de empleado ya está registrado'));
      } else {
        users.push({ usernumber, username, password });
        localStorage.setItem('users', JSON.stringify(users));
        resolve();
      }
    });
  }

  getUsers(): { usernumber: string, username: string, password: string }[] {
    return JSON.parse(localStorage.getItem('users') || '[]');
  }

  onLogin(user: string, password: string) {
    // TODO: Request GET con el HTTPClient que retorna un observable con la info
    // TODO: De ser exitoso almancenar la información del usuario en currentUser
    // 00000011
    // Aamd230299
    return this.http.post<UserLogged>('http://localhost:3000/auth/login', {
      numero_empleado: user,
      nom_contrasena: password
    })
    .pipe(
      tap(resp => {
        this.currentUser = resp;
        localStorage.setItem('token', this.currentUser.token)
      }),
      catchError(e => {
        console.log(e)
        return of([])
      })
    )
  }

  onLogout(): void {
    //TODO: Limpiar al usuario según sea necesario
    this.currentUser = null;
  }
}
