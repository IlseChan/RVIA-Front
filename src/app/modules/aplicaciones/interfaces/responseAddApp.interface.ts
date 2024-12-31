import { CheckmarxInfo } from "@modules/shared/interfaces";
import { Aplication } from "./aplicacion.interface";
import { RviaProcess } from "./rviaProcess.interface";

export interface ResponseAddApp {
    aplicacion:    Aplication;
    checkmarx?:     CheckmarxInfo;
    esSanitizacion: boolean;
    rviaProcess?:    RviaProcess;
}