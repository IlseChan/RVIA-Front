import { ApplicationConfig, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import localeEsMX from '@angular/common/locales/es-MX';
import { registerLocaleData  } from '@angular/common';

import { providePrimeNG } from 'primeng/config';
import { MessageService } from 'primeng/api';

import { routes } from './app.routes';
import { AuthInterceptor } from './helpers/interceptors/authToken.interceptor';
import { UnauthInterceptor } from './helpers/interceptors/unauth.interceptor';
import { RVIATHEME } from './scss/rvia-theme';

registerLocaleData(localeEsMX);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimationsAsync(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([AuthInterceptor,UnauthInterceptor])),
    providePrimeNG({ 
      theme: {
          preset: RVIATHEME,
          options: {
            darkModeSelector: false 
          }
      }
    }),
    MessageService,
    { provide: LOCALE_ID, useValue: 'es-MX' }
  ]
};
