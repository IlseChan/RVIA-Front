import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "@modules/auth/services/auth.service";

export const UserAuthGuard = (): boolean => {
    const router = inject(Router);
    const authService = inject(AuthService);

    console.log('userauth');
    
    const currentUser = authService.userLogged;
    console.log(currentUser);
    
    
    if(currentUser === null){
        return true;
    }
    
    router.navigate(['/apps/list'])
    return false;
}