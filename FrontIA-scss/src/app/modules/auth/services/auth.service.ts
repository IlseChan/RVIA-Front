import { Injectable } from '@angular/core';
import { UserLogged } from '../interfaces/userLogged.interface';
import { catchError, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

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
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzIxODM3NTE3LCJleHAiOjE3MjE4NDQ3MTd9.yXCcChs_qVj60uqciR0nS9K5olE-n3hA0e-pDldRrjU"
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
        return of([])
      })
    )
  }

  onLogout(): void {
    //TODO: Limpiar al usuario según sea necesario
    this.currentUser = null;
  }
}
