import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "@modules/auth/services/auth.service";

export const SessionGuard = (): boolean => {
    const router = inject(Router);
    const authService = inject(AuthService);
    const currentUser = authService.userLogged;
    
    if(!currentUser || !currentUser.token){
        router.navigate(['/auth/login']);
        return false;
    }

    return true;
}