export enum StatusApps {
    PROGRESS = 1,
    ONHOLD   = 2,
    DONE     = 3,
    REFUSED  = 4,
}

export interface OpcsStatus {
    firstValue: number;
    newStatus: number;
}

export interface Aplication {
    applicationstatus: Applicationstatus;
    idu_aplicacion:    number;
    nom_aplicacion:    string;
    sourcecode:        Sourcecode;
    user:              User;
}

export interface User {
    esActivo:        boolean;
    idu_usuario:     number;
    nom_correo:      string;
    nom_usuario:     string;
    numero_empleado: number;
    position:        Position;
}

export interface Position {
    idu_puesto: number;
    nom_puesto: string;
}

export interface Applicationstatus {
    des_estatus_aplicacion: string;
    idu_estatus_aplicacion: StatusApps;
}

export interface Sourcecode {
    idu_codigo_fuente: number;
    nom_codigo_fuente: string;
    nom_directorio:    string;
}

export interface AplicationsData {
    data: Aplication[];
    total: number
}