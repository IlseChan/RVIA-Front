import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  usernumber: string = '';
  username: string = '';
  password: string = '';
  confirmPassword: string = '';
  errorMessage: string = '';

  @ViewChild('passwordInput', { static: false }) passwordInput!: ElementRef;

  constructor(private authService: AuthService, private router: Router) {}

  onRegister(): void {
    const trimmedUsernumber = this.usernumber.trim();
    const trimmedUsername = this.username.trim();
    const trimmedPassword = this.password.trim();
    const trimmedConfirmPassword = this.confirmPassword.trim();

    if (!/^\d+$/.test(trimmedUsernumber)) {
      this.errorMessage = 'El número de empleado debe contener solo números';
      return;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    console.log(`NumeroEmpleado: ${trimmedUsernumber}, Usuario: ${trimmedUsername}, Contraseña: ${trimmedPassword}`);

    this.authService.register(trimmedUsernumber, trimmedUsername, trimmedPassword)
      .then(() => {
        console.log('Registro exitoso');
        alert('Registro exitoso');
        this.errorMessage = ''; // Limpiar mensaje de error en caso de éxito
        this.router.navigate(['/apps/home']);  // Navega a la página de inicio
      })
      .catch((error: any) => {
        this.errorMessage = error.message;
      });
  }

  onInputChange(): void {
    this.errorMessage = ''; // Limpiar mensaje de error al cambiar el input
  }

  onBack(): void {
    this.router.navigate(['/auth/login']); // Navega a la página de login
  }
}
