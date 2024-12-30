import { Usuario } from "@modules/usuarios/interfaces";

export interface RespUsuario {
    user:   Usuario;
    token?: string;
}
