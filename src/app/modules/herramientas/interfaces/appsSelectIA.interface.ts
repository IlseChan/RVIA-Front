import { ArquitecturaOpciones } from "@modules/aplicaciones/interfaces/aplicaciones.interfaces";

export interface AppsSelectIA {
    app:     number;
    value:   string;
    waiting: waitingOpc[];
}

export interface waitingOpc {
    value: number;
    name:  string; 
}