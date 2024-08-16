export interface FormPDFtoCSV {
    appId:   number;
    pdfFile: File;
}

export enum OriginMethod { 
    GETDOWNLOADCSV = 'GETDOWNLOADCSV',
    POSTMAKECSV    = 'POSTMAKECSV', 
}
 
export interface FormPDFtoCSV {
    appId:   number;
    pdfFile: File;
}