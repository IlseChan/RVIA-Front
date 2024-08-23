import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [NgIf, FormsModule,BadgeModule,TooltipModule,ButtonModule,
    InputTextModule,PasswordModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  usernumber: string = '';
  username: string = '';
  password: string = '';
  confirmPassword: string = '';
  email: string = '';
  errorMessage: string = '';

  isRegister: boolean = false;

  constructor(private router: Router, private authService: AuthService) {}

  onRegister(): void {
    const trimmedUsernumber = this.usernumber.trim();
    const trimmedUsername = this.username.trim();
    const trimmedPassword = this.password.trim();
    const trimmedConfirmPassword = this.confirmPassword.trim();
    const trimmedEmail = this.email.trim();

    const usernumberInt = parseInt(trimmedUsernumber, 10);
    if (!((usernumberInt > 90000000 && usernumberInt <= 99999999) || usernumberInt < 100000000)) {
      this.errorMessage = 'El número de empleado debe ser mayor a 90000000 y menor o igual a 99999999, o menor a 100000000';
      return;
    }

    if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{12,}$/.test(trimmedPassword)) {
      this.errorMessage = 'La contraseña debe tener al menos 12 caracteres, una letra mayúscula, un número y un caracter especial';
      return;
    }

    if (!/^\d+$/.test(trimmedUsernumber)) {
      this.errorMessage = 'El número de empleado debe contener solo números';
      return;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      this.errorMessage = 'El correo electrónico no es válido';
      return;
    }

    // Validación del dominio @coppel
    if (!/^[a-zA-Z0-9._%+-]+@coppel\.com$/.test(trimmedEmail)) {
      this.errorMessage = 'El correo electrónico debe ser de la forma nombre@coppel.com';
      return;
    }

    this.isRegister = true;
    this.authService.registerUser(trimmedUsernumber, trimmedUsername, trimmedPassword, trimmedEmail)
      .subscribe({
        next: () => {
          this.errorMessage = '';
        },
        error: (error: Error) => {
          this.errorMessage = error.message;
          this.isRegister = false;
        }
      });
  }

  onInputChange(): void {
    this.errorMessage = '';
  }

  onBack(): void {
    this.router.navigate(['/auth/login']);
  }
}
