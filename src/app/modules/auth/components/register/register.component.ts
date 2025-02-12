import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { PrimeNGModule } from '@modules/shared/prime/prime.module';
import { termsAndConditions } from './termsandcond';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, PrimeNGModule],
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
  termAccepted: boolean = false;
  isRegister: boolean = false;
  isReady: boolean = false;
  btnLabel: string = 'Registrar';
  connectionErrorMessage: string = '';
  
  isShowTerms: boolean = false;
  termsAndConditions = termsAndConditions;
  constructor(private router: Router, private authService: AuthService) {}

  onRegister(): void {
    const trimmedUsernumber = this.usernumber.trim();
    const trimmedUsername = this.username.trim();
    const trimmedPassword = this.password.trim();
    const trimmedConfirmPassword = this.confirmPassword.trim();
    const trimmedEmail = this.email.trim();

    const usernumberInt = parseInt(trimmedUsernumber, 10);
    if (!((usernumberInt > 90000000 && usernumberInt <= 99999999) || usernumberInt < 100000000)) {
      this.errorMessage = 'El número de empleado debe ser mayor a 90000000 y menor a 100000000';
      return;
    }

    if (!/^(?=.*[A-ZÑ])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-zñÑ\d@$!%*?&#]{12,}$/.test(trimmedPassword)) {
      this.errorMessage = 'La contraseña debe tener al menos 12 caracteres, una letra mayúscula, un número y un carácter especial';
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

    // Validación de nombre completo (al menos un nombre y dos apellidos con mayúsculas al principio)
    if (!/^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){2,}$/.test(trimmedUsername)) {
      this.errorMessage = 'Escribe nombre completo, con al menos un nombre y dos apellidos, todos comenzando con letra mayúscula, incluyendo acentos y ñ';
      return;
    }

    if(!this.termAccepted) {
      this.errorMessage = 'Debes aceptar los términos y condiciones';
      return;
    }

    this.isRegister = true;
    this.btnLabel = 'Registrando...';
    this.authService.registerUser(trimmedUsernumber, trimmedUsername, trimmedPassword, trimmedEmail)
      .pipe(
        finalize(() => this.btnLabel = 'Registrar')
      )
      .subscribe({
        next: () => {
          this.errorMessage = '';
          this.isReady = true;
        },
        error: (err) => {
          if (err.status === 0) {
            this.connectionErrorMessage = 'No se pudo conectar con el servidor.'; 
          } else {
            this.errorMessage = err.message || 'No se pudo conectar con el servidor. Favor de verificar.'; 
          }
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

  showTerms(fromForm: boolean = false): void {
    if((fromForm && this.termAccepted) || !fromForm) {
      this.isShowTerms = !this.isShowTerms
    }
  }
}
