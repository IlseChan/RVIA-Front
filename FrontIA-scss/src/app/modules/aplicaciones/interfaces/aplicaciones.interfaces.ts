export enum StatusApps {
    PROGRESS = 1,
    ONHOLD   = 2,
    DONE     = 3,
    REFUSED  = 4,
}

export interface OpcsStatus {
    newStatus: number;
    firstValue: number;
}

export interface Aplication {
    idu_aplicacion:    number;
    nom_aplicacion:    string;
    applicationstatus: Applicationstatus;
    sourcecode:        Sourcecode;
    user:              User;
}

export interface User {
    idu_usuario:     number;
    numero_empleado: number;
    nom_correo:      string;
    nom_usuario:     string;
    esActivo:        boolean;
    position:        Position;
}

export interface Position {
    idu_puesto: number;
    nom_puesto: string;
}

export interface Applicationstatus {
    idu_estatus_aplicacion: StatusApps;
    des_estatus_aplicacion: string;
}

export interface Sourcecode {
    idu_codigo_fuente: number;
    nom_codigo_fuente: string;
    nom_directorio:    string;
}