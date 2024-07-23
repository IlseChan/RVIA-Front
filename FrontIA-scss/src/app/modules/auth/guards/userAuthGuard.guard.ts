import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "@modules/auth/services/auth.service";

export const UserAuthGuard = (): boolean => {
    const router = inject(Router);
    const authService = inject(AuthService);

    const currentUser = authService.userLogged;
    
    if(currentUser === null){
        return true;
    }
    
    router.navigate(['/apps/list'])
    return false;
}