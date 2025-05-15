import { NgClass } from '@angular/common';
import { Component, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'rvia-password-strength',
  standalone: true,
  imports: [NgClass],
  templateUrl: './password-strength.component.html',
  styles: ``
})
export class PasswordStrengthComponent {

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
    return /[@$!%*?&#.]/.test(this.passwordValue);
  }

  hasMinLength(): boolean {
    return this.passwordValue.length >= 12;
  }
}