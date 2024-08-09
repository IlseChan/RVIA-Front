import { Aplication } from "@modules/aplicaciones/interfaces/aplicaciones.interfaces"
import { Usuario } from "../interfaces/usuario.interface";

export const elementPerPage = 5;

export const dataPerPage = (data: Usuario[] | Aplication[], page: number): Usuario[] | Aplication[]  => {
    const from = ( page -1 ) * elementPerPage;
    const to = from + elementPerPage;

    return data.slice(from,to);
}   