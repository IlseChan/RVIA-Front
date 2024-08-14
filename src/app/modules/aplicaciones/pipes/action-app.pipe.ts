import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'actionApp',
  standalone: true
})
export class ActionAppPipe implements PipeTransform {

  transform(value: number): string {
    const statusApp: {[key:number]: string} = {
      1: 'Actualización',
      2: 'Sanización',
      3: 'Migración',
    }

    return statusApp[value] || 'Error';
  }


}
