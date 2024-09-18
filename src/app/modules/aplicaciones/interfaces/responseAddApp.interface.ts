import { CheckmarxInfo } from "@modules/shared/interfaces";
import { Aplication } from "./aplicacion.interface";
import { RviaProcess } from "./rviaProcess.interface";

export interface ResponseAddApp {
    application:    Aplication;
    checkmarx?:     CheckmarxInfo;
    esSanitizacion: boolean;
    rviaProcess?:    RviaProcess;
}