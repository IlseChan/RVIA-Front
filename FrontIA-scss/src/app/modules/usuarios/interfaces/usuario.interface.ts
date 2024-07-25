export enum Nom_Puesto {
    ADMINISTRADOR = 'Administrador',  
    AUTORIZADOR   = 'Autorizador',
    INVITADO      = 'Invitado',
    USUARIO       =  'Usuario',
}

export enum Idu_Puesto {
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
}

export interface Position {
    idu_usuario: Idu_Puesto;
    nom_puesto: Nom_Puesto
}

export interface UsersData {
    data: Usuario[],
    total: number
}