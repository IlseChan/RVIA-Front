import { Position } from "./usuarioPosition.interface";

export interface Usuario {
    idu_aplicacion: number;
    idu_usuario:    number;
    nom_correo:     string;
    nom_usuario:    string;
    num_centro:     number;
    num_empleado:   number;
    num_encargado:  number;
    num_puesto:     number;
    opc_es_activo:  boolean;
    position:       Position;
    token?:         string;
}
