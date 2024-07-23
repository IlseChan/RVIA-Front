export enum Nom_Puesto {
    INVITADO      = 'Invitado',
    USUARIO       =  'Usuario',
    AUTORIZADOR   = 'Autorizador',
    ADMINISTRADOR = 'Administrador'  
}

export enum Idu_Puesto {
    ADMINISTRADOR = 1,
    AUTORIZADOR   = 2,
    USUARIO       = 3,
    INVITADO      = 4
}

export interface Usuario {
    idu_usuario:     number;
    numero_empleado: number;
    position: {
        idu_usuario: Idu_Puesto;
        nom_puesto: Nom_Puesto;
    } 
}

export interface ResponseGetUsuarios {
    data: Usuario[],
    total: number
}