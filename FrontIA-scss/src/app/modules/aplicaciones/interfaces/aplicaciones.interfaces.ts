export interface Aplication {
    id:   number;
    name: string;
    user: string;
    status: StatusApps;
    linkDownload?: string;
}

export enum StatusApps {
    DONE     = 1,
    PROGRESS = 2,
    REFUSED  = 3,
    ONHOLD   = 4
}

export interface GetAplicacionesResponse {
    data: Aplication[];
    total: number;
}

export interface OpcsStatus {
    newStatus: number;
    firstValue: number;
}