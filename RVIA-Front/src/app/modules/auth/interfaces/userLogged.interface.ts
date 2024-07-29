export interface UserLogged {
    idu_usuario:     number;
    nom_correo:      string;
    numero_empleado: number
    nom_usuario:     string;
    position:        Position;
    token:           string;
}

export interface Position{
    idu_puesto: number;
    nom_puesto: string;
}