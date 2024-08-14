import { inject } from "@angular/core";
import { Router } from "@angular/router";

import { AuthService } from "@modules/auth/services/auth.service";
import { Nom_Rol } from "@modules/shared/interfaces/usuario.interface";

export const AdminGuard = (): boolean => {
    const router = inject(Router);
    const authService = inject(AuthService);

    const currentUser = authService.userLogged;
    
    if(!currentUser){
        router.navigate(['/auth/login']);
        return false;
    }

    if (currentUser && currentUser.position.nom_rol !== Nom_Rol.ADMINISTRADOR){
        router.navigate(['/apps/home']);
        return false;
    }

    return true;
}