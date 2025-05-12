import { Opt_architec } from "./optionsArchitecForm.interface";

export interface FormNewApp {
    action:    number;  
    language:  number;
    opt_archi: Opt_architec; 
    pdfFile:   File | null;
    type:      string;
    urlGit:    string;
    zipFile:   File | null;
    idu_aplicacion_de_negocio: number;
}