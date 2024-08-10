import { Pipe, PipeTransform } from '@angular/core';

type Status = "success" | "secondary" | "info" | "warning" | "danger" | "contrast";

@Pipe({
  name: 'statusAppLabel',
  standalone: true
})
export class StatusAppLabelPipe implements PipeTransform {

  transform(value: number): Status | undefined {
    const statusApp: {[key:number]: Status} = {
      1: 'info',
      2: 'warning',
      3: 'success',
      4: 'danger',
    }

    return statusApp[value] || undefined;
  }

}
