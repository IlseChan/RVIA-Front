import { CheckmarxInfo } from "@modules/shared/interfaces/checkmarx.interface";
import { Usuario } from "@modules/usuarios/interfaces";

export enum StatusApps {
    PROGRESS = 1,
    ONHOLD   = 2,
    DONE     = 3,
    REFUSED  = 4,
}

export enum NumberAction {
    NONE         = 0,  
    UPDATECODE   = 1,
    SANITIZECODE = 2,
    MIGRATION    = 3,
}

export enum ArquitecturaOpciones {
    DOCUMENTATION = 1, 
    TEST_CASES = 2,    
    EVALUATION = 3,    
}

export interface OpcsStatus {
    firstValue: number;
    newStatus:  number;
}

export interface Aplication {
    applicationstatus: Applicationstatus;
    checkmarx:         CheckmarxCSV[];
    idu_aplicacion:    number;
    idu_proyecto:      string;
    nom_aplicacion:    string;
    num_accion:        number;
    opc_arquitectura:  Opt_architec;
    opc_lenguaje:      number;
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
    total: number;
}

export interface FormProjectWithPDF {
    action:    number;  
    language:  number;
    opt_archi: Opt_architec; 
    pdfFile:   File | null;
    type:      string;
    urlGit:    string;
    zipFile:   File | null;
}

export interface Opt_architec {
    [key: number]: boolean;
    1: boolean,
    2: boolean,
    3: boolean
}

export interface Language {
    idu_lenguaje: number;
    nom_lenguaje: string;
}

export enum OriginMethod {
    GETAPPS      = 'GETAPPS',
    GETCSVAPP    = 'GETCSVAPP', 
    GETDOWNLOAD  = 'GETDOWNLOAD',
    GETLANGUAGES = 'GETLANGUAGES',
    POSTSAVEPDF  = 'POSTSAVEPDF', 
    POSTSAVEFILE = 'POSTSAVEFILE',
    UPDATESTATUS = 'UPDATESTATUS', 
}

export interface FormPDF {
    pdfFile: File;
}

export interface CheckmarxCSV {
    idu_checkmarx:  number;
    nom_checkmarx:  string;
    nom_directorio: string;
} 

export interface ResponseSaveFile extends CheckmarxCSV {
    application: Aplication;
}

export interface AppsToUseSelect {
    value: number;
    name:  string;
}

export interface ResponseAddApp {
    application:    Aplication;
    checkmarx?:     CheckmarxInfo;
    esSanitizacion: boolean;
}

export interface OptStepper {
    label: string;
}

export interface OptRadio {
    image:   string;
    tooltip: string;
    value:   string;
}

export interface OptAction {
    txt:   string;
    value: number;
}
