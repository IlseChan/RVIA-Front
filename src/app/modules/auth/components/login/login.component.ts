import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { PrimeNGModule } from '@modules/shared/prime/prime.module';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, PrimeNGModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  usernumber: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoginDisabled: boolean = true;
  isLogging: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  onLogin(): void {
    if(this.isLogging) return;
    const trimmedUsernumber = this.usernumber.trim();
    const trimmedPassword = this.password.trim();

    this.isLogging = true;
    this.authService.loginUser(trimmedUsernumber, trimmedPassword)
    .subscribe({
      next: () => {
        this.errorMessage = '';
      },
      error: (err) => {
        if (err.status === 401) { 
          this.errorMessage = 'Número de empleado o contraseña incorrecta';
        } else if (err.status === 404) { 
          this.errorMessage = 'Número de empleado no encontrado';
        } else if (err.status === 0) {
          this.errorMessage = 'No hay conexión con el servidor. Favor de verificar.';
        } else {
          this.errorMessage = 'Número de empleado o contraseña incorrectos. Favor de verificar.';
        }
        this.isLogging = false;
      }
    });
  }

  onInputChange(): void {
    this.errorMessage = '';
    this.checkInputs();
  }

  onRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  private checkInputs(): void {
    const passwordValid = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{12,}$/.test(this.password);
    const usernumberInt = parseInt(this.usernumber, 10);
    const usernumberValid = (usernumberInt > 90000000 && usernumberInt < 100000000);

    this.isLoginDisabled = !(passwordValid && usernumberValid);
  }
}
