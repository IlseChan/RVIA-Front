import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusApp',
  standalone: true
})
export class StatusAppPipe implements PipeTransform {

  transform(value: number): string {
    const statusApp: {[key:number]: string} = {
       1: 'Finalizado',
       2: 'En proceso',
       3: 'Rechazado',
       4: 'En espera'
    }

    return statusApp[value] || 'Error';
  }

}
