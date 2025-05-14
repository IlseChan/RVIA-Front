import { Component } from '@angular/core';

@Component({
  selector: 'loader-rvia',
  standalone: true,
  template: `
    <div class="card flex justify-center mt-12">
      <span class="loader"></span>
    </div>
  `,
  styles: `
  .loader {
    width: 80px;
    height: 80px;
    border: 6px solid var(--bg-sidebar);
    border-bottom-color: var(--rvia-primary-color);
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
  }

  @keyframes rotation {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
  }`
})
export class LoaderComponent {

}
