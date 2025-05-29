import { Component, input } from '@angular/core';

@Component({
    selector: 'info-display',
    imports: [],
    templateUrl: './info-display.component.html',
    styles: ``
})
export class InfoDisplayComponent {

  key = input.required<string | number>();
  value = input .required<string | number>();
  wDivider = input<boolean>(false); 
}
