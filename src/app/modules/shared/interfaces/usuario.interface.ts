import { Idu_Rol } from "./Idu_Rol.enum";
import { Nom_Rol } from "./Nom_Rol.enum";

export interface Usuario {
    esActivo:        boolean;
    idu_usuario:     number;
    nom_correo:      string;
    nom_usuario:     string;
    numero_empleado: number;
    position:        Position;
    token?:          string;
}

export interface Position {
    idu_rol: Idu_Rol;
    nom_rol: Nom_Rol
}