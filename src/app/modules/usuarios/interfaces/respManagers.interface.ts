export interface RespManagers {
    encargados: Manager[]
}

export interface Manager {
    idu_encargado: number;
    nom_empleado:  string;
    num_empleado:  number;
    num_puesto:    number;
}