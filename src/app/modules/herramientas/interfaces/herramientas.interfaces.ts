export interface FormPDFtoCSV {
    idu_aplicacion:   number;
    file: File;
}

export enum OriginMethod { 
    GETDOWNLOADCSV = 'GETDOWNLOADCSV',
    PATCHRDOCCODE  = 'PATCHRDOCCODE',
    PATCHRTESTCASE = 'PATCHRTESTCASE',
    PATCHRATECODE  = 'PATCHRATECODE',
    POSTMAKECSV    = 'POSTMAKECSV', 
    POSTMAKECSVPY  = 'POSTMAKECSVPY', 
    POSTSTARTADDON = 'POSTSTARTADDON', 
}
 
export interface FormAddonCall {
    idu_aplicacion: number;
    conIA:    number;
}