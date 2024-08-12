import { Idu_Puesto, Usuario } from "@modules/shared/interfaces/usuario.interface";

export interface UsersData {
    data:  Usuario[];
    total: number;
}

export interface InitalValuesFormEdits {
    idu_puesto:  Idu_Puesto;
    nom_usuario: string;
}

export enum OriginMethod {
    DELETEUSERS = 'DELETEUSERS',
    GETUSER = 'GETUSER',
    GETUSERS = 'GETUSERS',
    UPDATEUSER = 'UPDATEUSER' 
}