export enum Nom_Rol {
    ADMINISTRADOR = 'Administrador',  
    AUTORIZADOR   = 'Autorizador',
    INVITADO      = 'Invitado',
    USUARIO       = 'Usuario',
}

export enum Idu_Rol {
    ADMINISTRADOR = 1,
    AUTORIZADOR   = 2,
    USUARIO       = 3,
    INVITADO      = 4
}

export interface Usuario {
    esActivo:        boolean;
    idu_usuario:     number;
    nom_correo:      string;
    nom_usuario:     string;
    numero_empleado: number;
    position:        Position;
    token?:          string;
}

export interface Position {
    idu_rol: Idu_Rol;
    nom_rol: Nom_Rol
}