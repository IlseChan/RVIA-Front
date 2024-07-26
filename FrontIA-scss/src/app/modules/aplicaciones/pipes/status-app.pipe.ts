import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusApp',
  standalone: true
})
export class StatusAppPipe implements PipeTransform {

  transform(value: number): string {
    const statusApp: {[key:number]: string} = {
      1: 'En proceso',
      2: 'En espera',
      3: 'Finalizado',
      4: 'Rechazado',
    }

    return statusApp[value] || 'Error';
  }

}
