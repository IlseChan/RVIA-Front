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
  private rgxNameUser = /^(?:[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:-[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?|de|del|la|las|los|y)(?:\s+(?:[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:-[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?|de|del|la|las|los|y)){1,}$/;       
  private rgxEmail = /^[A-Za-z0-9._%+-]+@(coppel\.com|aforecoppel\.com|bancoppel\.com)$/;
  private rgxPass = /^(?=.*[A-ZÑ])(?=.*\d)(?=.*[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])[A-Za-zñÑ\d!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]{12,}$/
  rgxSpecialChar = /[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/;

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

  completeUserName(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {      
      const value = control.value;
      if(value){
        return this.rgxNameUser.test(value) ? null : { invalidName: true }
      }

      return null
    }
  }

  employeeNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if(value){
        const usernumberInt = parseInt(value, 10);
        return (usernumberInt > 90000000 && usernumberInt <= 99999999) 
          ? null 
          : { invalidNumber: true }
      }

      return null
    }
  }

  emailCoppel(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if(value){
        
        return this.rgxEmail.test(value) 
          ? null 
          : { invalidEmail: true }
      }

      return null
    } 
  }

  passwordValidation(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if(value){
        return this.rgxPass.test(value) 
          ? null 
          : { invalidPassword: true }
      }

      return null
    }
  }
  
  passwordMatch(passField: string, confPassField: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const password = formGroup.get(passField)?.value;
      const confirmPassword = formGroup.get(confPassField)?.value;
      if (password !== confirmPassword) {
        formGroup.get(confPassField)?.setErrors({ passwordMismatch: true });
        return { passwordMismatch: true };
      } else {
        const errors = formGroup.get(confPassField)?.errors;
        if (errors) {
          delete errors['passwordsMismatch'];
          if (Object.keys(errors).length === 0) {
            formGroup.get(confPassField)?.setErrors(null);
          } else {
            formGroup.get(confPassField)?.setErrors(errors);
          }
        }
        return null;
      }
    }
  }

  sameCode(field1: string, field2: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const v1 = formGroup.get(field1)?.value;
      const v2 = formGroup.get(field2)?.value;

      if (v1 && v2 && v1 === v2) {
        return { sameCode: true };
      }

      return null;
    };
  }

  passwordCheckRgx(value: string): boolean {
    return this.rgxPass.test(value);
  }
}
