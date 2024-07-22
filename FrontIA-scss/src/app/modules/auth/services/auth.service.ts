import { Injectable } from '@angular/core';
import { UserLogged } from '../interfaces/userLogged.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  get userLogged(): UserLogged {
    // return { rol: 'Invitado'};
    // return { rol: 'Usuario'};
    // return { rol: 'Autorizador'};
    return { rol: 'Administrador'};
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
}
