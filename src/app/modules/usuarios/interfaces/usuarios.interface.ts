import { Idu_Puesto, Usuario } from "@modules/shared/interfaces/usuario.interface";

export interface UsersData {
    data:  Usuario[];
    total: number;
}

export interface InitalValuesFormEdits {
    nom_usuario: string;
    idu_puesto:  Idu_Puesto;
}