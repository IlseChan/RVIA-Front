import { Opt_architec } from "./optionsArchitecForm.interface";
import { StatusApp } from "./statusApp.enum";

export interface Aplication {
    idu_aplicacion:    number;
    idu_proyecto:      string;
    nom_aplicacion:    string;
    idu_usuario:       number;
    num_accion:        number;
    opc_arquitectura:  Opt_architec;
    clv_estatus:       StatusApp | 0;
    opc_lenguaje:      number;
    opc_estatus_doc:       StatusApp | 0;
    opc_estatus_doc_code:  StatusApp | 0;
    opc_estatus_caso:      StatusApp | 0;
    opc_estatus_calificar: StatusApp | 0;
}