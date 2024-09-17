import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  template: `
  <div class="flex align-items-center p-5 h-full justify-content-center">
    <img 
        src="assets/images/logo-rvia.png" 
        alt="rvia-logo" 
        class="img-rvia"
    />
  </div>`,
  styles: [`
    .img-rvia {
      max-width: 80%;
      max-height: 80%;
      object-fit: contain;
    }
    ` 
  ] 
})
export class HomeComponent { }
