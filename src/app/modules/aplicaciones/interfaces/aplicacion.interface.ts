import { CheckmarxBaseInfo } from "@modules/shared/interfaces";
import { Opt_architec } from "./optionsArchitecForm.interface";
import { Sourcecode } from "./sourceCode.interface";
import { StatusApp } from "./statusApp.enum";
import { NumberAction } from "./numberAction.enum";

export interface   Aplication {
    checkmarx:         CheckmarxBaseInfo[];
    clv_estatus:       StatusApp;
    idu_aplicacion:    number;
    idu_proyecto:      string;
    idu_usuario:       number;
    nom_aplicacion:    string;
    num_accion:        NumberAction;
    opc_arquitectura:  Opt_architec;
    opc_estatus_calificar: StatusApp | 0;
    opc_estatus_caso:      StatusApp | 0;
    opc_estatus_doc:       StatusApp | 0;
    opc_estatus_doc_code:  StatusApp | 0;
    opc_lenguaje:      number;
    sourcecode:        Sourcecode;
    totalCost:         number;
}