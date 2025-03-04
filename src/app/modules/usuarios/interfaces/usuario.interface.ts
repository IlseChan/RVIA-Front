import { Position } from "./usuarioPosition.interface";

export interface Usuario {
    idu_usuario:   number;
    nom_correo:    string;
    nom_usuario:   string;
    num_empleado:  number;
    opc_es_activo: boolean;
    position:      Position;
    token?:        string;
}
