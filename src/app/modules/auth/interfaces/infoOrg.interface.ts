import { AppOrg } from "./appOrg.interface";
import { Centro } from "./centro.interface";
import { Encargado } from "./encargado.interface";

export interface InfoOrg {
    aplicaciones: AppOrg[];
    centros: Centro[];
    superiores: Encargado[];
}