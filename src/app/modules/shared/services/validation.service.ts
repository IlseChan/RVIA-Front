import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  private zipTypes = ['application/zip','application/x-zip-compressed','multipart/x-zip','application/x-compressed'];
  private sevenZipTypes = ['application/x-7z-compressed','application/x-compressed','application/x-7z'];
  private pdfTypes = ['application/pdf','application/x-pdf','application/acrobat','text/pdf','text/x-pdf'];
  private csvTypes = ['text/csv','application/csv','application/vnd.ms-excel'];
  
  private rgxUrlGit = /^(https?:\/\/)?(www\.)?(github|gitlab)\.com\/[\w.-]+\/[\w.-]+(-[\w.-]*)?\.git$/;
         

  constructor() { }

  fileValidation(type:string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const file = control.value;
      
      if(file){
        const fileType = file.type;
        const elemts = file.name.split('.');
        const ext = elemts[elemts.length -1];

        if(type === 'zip'){
          
          if(fileType === '' || this.sevenZipTypes.includes(fileType)){
            return ext === '7z' ? null : { invalidType: true };
          }

          return (ext === 'zip' && this.zipTypes.includes(fileType)) 
            ? null
            : { invalidType: true };
        }
        
        if(type === 'pdf'){
          return (ext === 'pdf' && this.pdfTypes.includes(fileType)) 
            ? null 
            : { invalidTypePdf: true };
        }

        if(type === 'csv'){
          return (ext === 'csv' && this.csvTypes.includes(fileType)) 
            ? null 
            : { invalidTypeCSV: true }
        }
      }

      return null;
    }
  } 

  isValidGitlabUrl(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      
      const value = control.value;
      if(value){
        return this.rgxUrlGit.test(value) ? null : { invalidUrl: true }
      }

      return null
    }
  }

  noBlankValidation(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = (control.value || '').trim().length === 0;

      return !value ? null : { whitespace: true };
    }
  }
  
  noWhitespaceValidation(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const file = control.value;
      
      if(file){
        const isWhitespace = (file.name || '').trim().length === 0;
        const isValid = !/\s/.test(file.name);
        return isWhitespace || !isValid ? { invalidName: true } : null;
      }
      
      return null
    };
  } 
 
}
