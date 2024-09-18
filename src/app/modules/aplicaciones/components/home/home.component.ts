import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  template: `
  <div class="flex flex-column align-items-center p-5 h-full justify-content-center">
    <img 
        src="assets/images/logo-rvia.png" 
        alt="rvia-logo" 
        class="img-rvia"
    />
    <h2 class="text-8xl m-0">Bienvenidos</h2>
  </div>`,
  styles: [`
    .img-rvia {
      max-width: 80%;
      max-height: 80%;
      object-fit: contain;
    }

    h2{
      color: var(--rvia-primary-color);
    }
    ` 
  ] 
})
export class HomeComponent { }
