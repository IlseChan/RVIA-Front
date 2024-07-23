import { Usuario } from "@modules/usuarios/interfaces/usuario.interface";

// export interface Aplication {
//     id:   number;
//     name: string;
//     user: string;
//     status: StatusApps;
//     linkDownload?: string;
// }

export enum StatusApps {
    DONE     = 1,
    PROGRESS = 2,
    REFUSED  = 3,
    ONHOLD   = 4
}

export interface GetAplicacionesResponse {
    // data: Aplication[];
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
    idu_estatus_aplicacion: number;
    des_estatus_aplicacion: string;
}

export interface Sourcecode {
    idu_codigo_fuente: number;
    nom_codigo_fuente: string;
    nom_directorio:    string;
}