export interface FormPDFtoCSV {
    appId:   number;
    pdfFile: File;
}

export enum OriginMethod { 
    GETDOWNLOADCSV = 'GETDOWNLOADCSV',
    POSTMAKECSV    = 'POSTMAKECSV', 
    POSTSTARTADDON = 'POSTSTARTADDON', 
}
 
export interface FormPDFtoCSV {
    appId:   number;
    pdfFile: File;
}

export interface FormAddonCall {
    idu_aplicacion: number;
    conIA:    number;
}