import { Component } from '@angular/core';

@Component({
    selector: 'app-home',
    template: `
      <section class="h-full flex">
        <div class="flex flex-1 flex-col items-center justify-center">
          <img 
              src="assets/images/logo-rvia.webp" 
              alt="rvia-logo" 
              class="img-rvia"
          />
          <h2 class="text-7xl m-0">Bienvenidos</h2>
        </div>
      </section>`,
    styles: [`
      .img-rvia {
        width: 60%;
        height: 60%;
        object-fit: contain;
      }

      h2 {
        color: var(--rvia-primary-color);
      }
    `
    ]
})
export class HomeComponent { }
