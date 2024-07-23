import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface User {
  usernumber: string;
  password: string;
  // otros campos que tu usuario pueda tener
}

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

  @ViewChild('passwordInput', { static: false }) passwordInput!: ElementRef;

  constructor(private authService: AuthService, private router: Router) {}

  onLogin(): void {
    const trimmedUsernumber = this.usernumber.trim();
    const trimmedPassword = this.password.trim();

    // const users: User[] = this.authService.getUsers();
    // const user = users.find((u: User) => u.usernumber === trimmedUsernumber && u.password === trimmedPassword);

    // if (user) {
      console.log('Autenticación exitosa');
      // alert('Autenticación exitosa');
      this.errorMessage = ''; // Limpiar mensaje de error en caso de éxito
      
      this.authService.onLogin(trimmedUsernumber,trimmedPassword).subscribe(resp => {
        console.log('Respuesta en el login component');
        this.router.navigate(['/apps/home']);  // Navega a la página de inicio
      }); 
    // } else {
    //   this.errorMessage = 'Número de empleado o contraseña incorrecta';
    // }
  }

  onInputChange(): void {
    this.errorMessage = ''; // Limpiar mensaje de error al cambiar el input
  }

  onRegister(): void {
    this.router.navigate(['/auth/register']);  // Navega a la página de registro
  }
}
