import { Position } from "./usuarioPosition.interface";

export interface Usuario {
    esActivo:        boolean;
    idu_usuario:     number;
    nom_correo:      string;
    nom_usuario:     string;
    num_empleado: number;
    position:        Position;
    token?:          string;
}
