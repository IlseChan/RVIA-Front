import { inject } from "@angular/core";
import { Router } from "@angular/router";

import { AuthService } from "@modules/auth/services/auth.service";
import { Nom_Rol } from "../interfaces";

export const AdminGuard = (): boolean => {
    const router = inject(Router);
    const authService = inject(AuthService);

    const currentUser = authService.userLogged;
    
    if (!currentUser) {
        router.navigate(['/auth/login']);
        return false;
    }
   
    if (currentUser.position.nom_rol === Nom_Rol.ADMINISTRADOR) {
        return true;
    }
    
    router.navigate(['/apps/list-apps']);
    return false;
}
