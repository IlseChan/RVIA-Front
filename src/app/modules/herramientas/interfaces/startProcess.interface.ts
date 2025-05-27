import { Aplication } from "@modules/aplicaciones/interfaces";

export interface StartProcess {
    application: Aplication;
    rviaProcess: {
        isValidProcess: boolean;
        messageRVIA: string;
    }
}