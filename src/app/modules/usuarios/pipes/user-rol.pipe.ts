import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'userRol',
  standalone: true
})
export class UserRolPipe implements PipeTransform {

  transform(value: number): string {
    const nomRol: {[key:number]: string} = {
      1: 'Administrador',
      2: 'Autorizador',
      3: 'Usuario',
      4: 'Invitado',
    }

    return nomRol[value] || 'Error';
  }

}
