import { inject } from "@angular/core";
import { Router } from "@angular/router";

import { AuthService } from "@modules/auth/services/auth.service";
import { Nom_Rol } from "@modules/usuarios/interfaces";

export const NewAplicationGuard = (): boolean => {
    const validRol: string[] = [Nom_Rol.ADMINISTRADOR,Nom_Rol.AUTORIZADOR,Nom_Rol.USUARIO];
    const router = inject(Router);
    const authService = inject(AuthService);

    const currentUser = authService.userLogged;
     
    if(!currentUser){
        router.navigate(['/auth/login']);
    }

    if (currentUser && !validRol.includes(currentUser!.position.nom_rol)){
        router.navigate(['/apps/home']);
        return false;
    }

    return true;
}