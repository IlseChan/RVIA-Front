import { inject } from "@angular/core";
import { Router } from "@angular/router";

import { AuthService } from "@modules/auth/services/auth.service";
import { Nom_Puesto } from "@modules/shared/interfaces/usuario.interface";

export const AdminGuard = (): boolean => {
    const router = inject(Router);
    const authService = inject(AuthService);

    const currentUser = authService.userLogged;
    
    if(!currentUser){
        router.navigate(['/auth/login'])
        return false;
    }

    if (currentUser && currentUser.position.nom_puesto !== Nom_Puesto.ADMINISTRADOR){
        router.navigate(['/apps/home'])
        return false;
    }

    return true;
}