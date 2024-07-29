import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "@modules/auth/services/auth.service";
import { Observable, tap } from "rxjs";

export const SessionGuard = (): boolean | Observable<boolean> => {
    const router = inject(Router);
    const authService = inject(AuthService);
    
    return authService.tokenValidation()
        .pipe(
            tap( isAuth => {
                if(!isAuth){
                    router.navigate(['./auth/login'])
                }
            })
        )
}