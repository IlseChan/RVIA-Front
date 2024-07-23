import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "@modules/auth/services/auth.service";
import { Nom_Puesto } from "@modules/usuarios/interfaces/usuario.interface";
// import { Role ]} from "@modules/usuarios/interfaces/usuario.interface";

export const AplicacionesGuard = (): boolean => {
    const validRol: string[] = [Nom_Puesto.ADMINISTRADOR,Nom_Puesto.AUTORIZADOR,Nom_Puesto.USUARIO];
    const router = inject(Router);
    const authService = inject(AuthService);

    const currentUser = authService.userLogged;
     
    if(!currentUser){
        router.navigate(['/auth/login'])
    }

    if (currentUser && !validRol.includes(currentUser!.position.nom_puesto) ){
        router.navigate(['/apps/home'])
        return false;
    }

    return true;
}