import { AppOrg, Centro, Encargado, Position } from "@modules/auth/interfaces";
import { Usuario } from './usuario.interface';

export interface UsuarioCmplt extends Usuario {
    aplicacion: AppOrg;
    centro:     Centro;
    encargado:  Encargado;
    puesto:     Position;
}
