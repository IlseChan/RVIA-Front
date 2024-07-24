import { Component, ViewChild, ElementRef } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [NgIf, FormsModule],
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

  @ViewChild('passwordInput', { static: false }) passwordInput!: ElementRef;

  constructor(private router: Router, private authService: AuthService) {}

  onRegister(): void {
    const trimmedUsernumber = this.usernumber.trim();
    const trimmedUsername = this.username.trim();
    const trimmedPassword = this.password.trim();
    const trimmedConfirmPassword = this.confirmPassword.trim();
    const trimmedEmail = this.email.trim();

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

    this.authService.register(trimmedUsernumber, trimmedUsername, trimmedPassword, trimmedEmail)
      .subscribe({
        next: () => {
          alert('Registro exitoso');
          this.errorMessage = ''; // Limpiar mensaje de error en caso de éxito
          this.router.navigate(['/auth/login']);  // Navega a la página de login
        },
        error: (error: Error) => { // Especificar el tipo de error
          this.errorMessage = error.message;
        }
      });
  }

  onInputChange(): void {
    this.errorMessage = ''; // Limpiar mensaje de error al cambiar el input
  }

  onBack(): void {
    this.router.navigate(['/auth/login']); // Navega a la página de login
  }
}
