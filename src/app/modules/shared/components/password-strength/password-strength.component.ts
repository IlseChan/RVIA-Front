import { NgClass } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { ValidationService } from '@modules/shared/services/validation.service';

@Component({
    selector: 'rvia-password-strength',
    imports: [NgClass],
    templateUrl: './password-strength.component.html',
    styles: ``
})
export class PasswordStrengthComponent {

  private vldtnSrvc = inject(ValidationService)
  control = input.required<AbstractControl>() ;
  
  private get passwordValue(): string {
    return this.control()?.value || '';
  }

  hasUppercase(): boolean {
    return /[A-ZÑ]/.test(this.passwordValue);
  }

  hasLowercase(): boolean {
    return /[a-zñ]/.test(this.passwordValue);
  }

  hasNumber(): boolean {
    return /\d/.test(this.passwordValue);
  }

  hasSpecialChar(): boolean {
    return this.vldtnSrvc.rgxSpecialChar.test(this.passwordValue);
  }

  hasMinLength(): boolean {
    return this.passwordValue.length >= 12;
  }
}