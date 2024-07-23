export enum Role {
    INVITADO      = 'Invitado',
    USUARIO       =  'Usuario',
    AUTORIZADOR   = 'Autorizador',
    ADMINISTRADOR = 'Administrador'  
}

export interface Usuario {
    username:    string;
    usernumber: string;
    rol:  Role
}

export interface ResponseGetUsuarios {
    data: Usuario[],
    total: number
}