import { Component, ViewChild, ElementRef } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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
  errorMessage: string = '';

  @ViewChild('passwordInput', { static: false }) passwordInput!: ElementRef;

  constructor(private router: Router) {}

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

    // Simula el éxito del registro
    alert('Registro simulado exitoso');
    this.errorMessage = ''; // Limpiar mensaje de error en caso de éxito
    this.router.navigate(['/auth/login']);  // Navega a la página de login
  }

  onInputChange(): void {
    this.errorMessage = ''; // Limpiar mensaje de error al cambiar el input
  }

  onBack(): void {
    this.router.navigate(['/auth/login']); // Navega a la página de login
  }
}