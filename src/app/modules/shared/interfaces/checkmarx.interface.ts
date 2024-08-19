import { Aplication } from "@modules/aplicaciones/interfaces/aplicaciones.interfaces";

export interface CheckmarxInfo {
    nom_checkmarx:  string;
    nom_directorio: string;
    idu_checkmarx:  number;
    application:    Aplication;
}

export interface CheckmarxPDFCSV {
    checkmarx?: CheckmarxInfo;
    error?:     ErrorPython;
    isValid:    boolean;
    message:    string;
}

export interface ErrorPython {
    code: number;
    killed: boolean;
    signal: null;
    cms:    string;
    stdout: string;
    stderr: string;
}