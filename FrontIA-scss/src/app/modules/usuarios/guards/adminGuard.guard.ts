import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "@modules/auth/services/auth.service";
import { Nom_Puesto } from "../interfaces/usuario.interface";

export const AdminGuard = (): boolean => {
    const router = inject(Router);
    const authService = inject(AuthService);

    const currentUser = authService.userLogged;
    
    if(!currentUser){
        router.navigate(['/auth/login'])
    }

    if (currentUser && currentUser.position.nom_puesto !== Nom_Puesto.ADMINISTRADOR){
        router.navigate(['/apps/home'])
        return false;
    }

    return true;
}