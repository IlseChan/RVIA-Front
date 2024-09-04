import { Usuario } from "@modules/shared/interfaces/usuario.interface";

export interface UsersData {
    data:  Usuario[];
    total: number;
}