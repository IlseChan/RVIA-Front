import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'actionApp',
  standalone: true
})
export class ActionAppPipe implements PipeTransform {

  transform(value: number): string {
    const statusApp: {[key:number]: string} = {
      0: 'Sin modificación de código',
      1: 'Actualización',
      2: 'Sanitización',
      3: 'Migración',
    }

    return statusApp[value] || 'Error';
  }


}
