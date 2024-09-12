import { Aplication } from "@modules/aplicaciones/interfaces/aplicacion.interface";
import { Usuario } from "@modules/usuarios/interfaces";

export const elementPerPage = 5;

export const dataPerPage = (data: Usuario[] | Aplication[], page: number): Usuario[] | Aplication[]  => {
    const from = ( page -1 ) * elementPerPage;
    const to = from + elementPerPage;

    return data.slice(from,to);
}   