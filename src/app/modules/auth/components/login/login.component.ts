import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NgIf, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  usernumber: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoginDisabled: boolean = true;

  @ViewChild('passwordInput', { static: false }) passwordInput!: ElementRef;

  constructor(private authService: AuthService, private router: Router) {}

  onLogin(): void {
    const trimmedUsernumber = this.usernumber.trim();
    const trimmedPassword = this.password.trim();

    this.authService.onLogin(trimmedUsernumber, trimmedPassword).subscribe({
      next: (resp) => {
        this.errorMessage = ''; 
        this.router.navigate(['/apps/list-apps']);  
      },
      error: (err) => {
        if (err.status === 401) { 
          this.errorMessage = 'Número de empleado o contraseña incorrecta';
        } else if (err.status === 404) { 
          this.errorMessage = 'Número de empleado no encontrado';
        } else {
          this.errorMessage = 'Número de empleado o Contraseña incorrectos. Por favor de verificar.';
        }
      }
    });
  }

  onInputChange(): void {
    this.errorMessage = '';
    this.checkInputs();
  }

  onRegister(): void {
    this.router.navigate(['/auth/register']);  // Navega a la página de registro
  }

  private checkInputs(): void {
    const passwordValid = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{12,}$/.test(this.password);
    const usernumberInt = parseInt(this.usernumber, 10);
    const usernumberValid = (usernumberInt > 90000000 && usernumberInt <= 99999999) || usernumberInt < 100000000;

    this.isLoginDisabled = !(passwordValid && usernumberValid);
  }
}
