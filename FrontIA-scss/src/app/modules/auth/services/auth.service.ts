import { Injectable } from '@angular/core';
import { UserLogged } from '../interfaces/userLogged.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: UserLogged | null = null;

  constructor() { }

  get userLogged(): UserLogged | null {
    // return  this.currentUser;
    return {  
      username:   'Penta Cero Miedo',
      usernumber: '99872123',
      token:      'esteesuntokencomodequeno',
      // rol:        'Invitado'
      // rol: 'Usuario',
      // rol: 'Autorizador',
      rol: 'Administrador'
    };
  }

  onLogin(user: string, password: string) {
    // TODO: Request GET con el HTTPClient que retorna un observable con la info
    // TODO: De ser exitoso almancenar la información del usuario en currentUser

    // Este codigo solo es local [ELIMINAR CUANDO SE TENGA BD Y RESPUESTA]
    this.currentUser = {  
      username:   'Penta Cero Miedo',
      usernumber: '99872123',
      token:      'esteesuntokencomodequeno',
      // rol:        'Invitado'
      // rol: 'Usuario',
      rol: 'Autorizador',
      // rol: 'Administrador'
    };
  }

  onLogout(): void {
    //TODO: Limpiar al usuario segun sea necesario
    this.currentUser = null;
  }
}
