import { Centro } from "./centro.interface";
import { Encargado } from "./encargado.interface";

export interface InfoOrg {
    centros: Centro[];
    superiores: Encargado[];
}