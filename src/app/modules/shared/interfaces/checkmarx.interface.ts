import { Aplication } from "@modules/aplicaciones/interfaces/aplicaciones.interfaces";

export interface CheckmarxBaseInfo {
    idu_checkmarx:  number;
    nom_checkmarx:  string;
    nom_directorio: string;
} 

export interface CheckmarxInfo extends CheckmarxBaseInfo {
    application:    Aplication;
}

export interface CheckmarxPDFCSV {
    checkmarx?:     CheckmarxInfo;
    error?:         ErrorPython;
    isValid:        boolean;
    isValidProcess: boolean;
    message:        string;
    messageRVIA:    string;
}

export interface ErrorPython {
    code: number;
    killed: boolean;
    signal: null;
    cms:    string;
    stdout: string;
    stderr: string;
}