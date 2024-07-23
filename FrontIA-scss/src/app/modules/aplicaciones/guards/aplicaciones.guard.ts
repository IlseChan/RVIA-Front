import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "@modules/auth/services/auth.service";
import { Role } from "@modules/usuarios/interfaces/usuario.interface";

export const AplicacionesGuard = (): boolean => {
    const validRol: string[] = [Role.ADMINISTRADOR,Role.AUTORIZADOR,Role.USUARIO];
    const router = inject(Router);
    const authService = inject(AuthService);

    const currentUser = authService.userLogged;
    
    if(!currentUser){
        router.navigate(['/auth/login'])
    }

    if (currentUser && !validRol.includes(currentUser!.rol) ){
        router.navigate(['/apps/home'])
        return false;
    }

    return true;
}