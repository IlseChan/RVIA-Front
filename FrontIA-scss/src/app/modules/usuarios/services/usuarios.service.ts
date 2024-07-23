import { Injectable } from '@angular/core';
import { Usuario, ResponseGetUsuarios } from '../interfaces/usuario.interface';
import { delay, Observable, of } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class UsuariosService {  
  usuarios = {
    data: [
      {usernumber: "12312412", username: "Arturo Solis", rol: 'Invitado'},
      {usernumber: "12312413", username: "Otro Arturo Solis", rol: 'Usuario'},
      {usernumber: "12312414", username: "Brandon Jaimes", rol: 'Administrador'},
      {usernumber: "12312415", username: "Otro Brandon Jaimes", rol: 'Autorizador'},
      {usernumber: "12312416", username: "Otro Angel Magana", rol: 'Invitado'},
      {usernumber: "12312417", username: "Angel Magana", rol: 'Usuario'},
      {usernumber: "12312418", username: "Ilse Chan", rol: 'Administrador'},
      {usernumber: "12312419", username: "Otro Ilse Chan", rol: 'Invitado'},
    ],
    total: 8
  } as ResponseGetUsuarios

  constructor() { }

  getUsuarios(page: number = 1): Observable<ResponseGetUsuarios> {
    const from = ( page -1 ) * 5;
    const to = from + 5;
    const tmpData = this.usuarios.data.slice(from,to);
    
    return of({
      data: [...tmpData],
      total: this.usuarios.total
    })
  }

  getUsuarioById(id: string): Observable<Usuario | undefined>{
    const user = this.usuarios.data.filter(user => user.usernumber === id);
    
    if(user.length > 0){
      return of(user[0])
    }

    return of(undefined)
  }

  updateUsuario(user: Usuario): Observable<any> {
    
    return of({
      ok: true,
      message: 'Se actualizo',
      user
    }).pipe(
      delay(2000)
    )
  }

  deleteUsuario(id: string): Observable<any> {
    
    const temp = this.usuarios.data.filter(u => u.usernumber !== id);
    this.usuarios.data = [...temp];
    this.usuarios.total = temp.length;

    return of({
      ok: true,
      message: 'Se elimino'
    }).pipe(
      delay(2000)
    )
  }

}
