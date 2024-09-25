import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, map, throwError } from "rxjs";

import { AuthService } from "@modules/auth/services/auth.service";

export const UnauthInterceptor = (request: HttpRequest<unknown>, next: HttpHandlerFn) => {       
    const authService = inject(AuthService);
    const router = inject(Router);

    return next(request).pipe(
        map((response: HttpEvent<any>) => {
          return response;
        }),
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401 && !error.url?.includes('/check-status')) {
            authService.logoutUser();
            router.navigate(['auth/login'],{ replaceUrl: true });
          }
          return throwError(() => error);
        })
      );
}