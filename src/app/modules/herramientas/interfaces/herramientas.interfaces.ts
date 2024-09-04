export interface FormPDFtoCSV {
    appId:   number;
    pdfFile: File;
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