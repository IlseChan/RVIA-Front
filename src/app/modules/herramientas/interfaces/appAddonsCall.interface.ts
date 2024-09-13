import { Aplication } from "@modules/aplicaciones/interfaces/aplicacion.interface";

export interface AppAddonsCall extends Aplication{
    isProccessValid: boolean;
    message:         string;
}