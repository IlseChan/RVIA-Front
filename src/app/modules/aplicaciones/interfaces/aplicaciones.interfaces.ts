import { Usuario } from "@modules/shared/interfaces/usuario.interface";

export enum StatusApps {
    PROGRESS = 1,
    ONHOLD   = 2,
    DONE     = 3,
    REFUSED  = 4,
}

export interface OpcsStatus {
    firstValue: number;
    newStatus:  number;
}

export interface Aplication {
    applicationstatus: Applicationstatus;
    idu_aplicacion:    number;
    nom_aplicacion:    string;
    sourcecode:        Sourcecode;
    user:              Usuario;
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
    data:  Aplication[];
    total: number
}

export interface FormProjectWithPDF{
    action:   number;  
    language: number;
    pdfFile:  File | null;
    type:     string;
    urlGit:   string;
    zipFile:  File | null;
}

export interface Language{
    idu_lenguaje: number;
    nom_lenguaje: string;
}