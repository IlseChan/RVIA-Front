import { Centro, Encargado, Position } from "@modules/auth/interfaces";
import { Usuario } from './usuario.interface';

export interface UsuarioCmplt extends Usuario {
    centro:     Centro;
    encargado:  Encargado;
    puesto:     Position;
}
