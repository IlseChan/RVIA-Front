import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, Subject } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { PrimeNGModule } from '@modules/shared/prime/prime.module';
import { termsAndConditions } from './termsandcond';
import { ValidationService } from '@modules/shared/services/validation.service';

@Component({
  selector: 'rvia-register',
  standalone: true,
  imports: [ReactiveFormsModule, PrimeNGModule, NgFor, NgIf],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  isRegister: boolean = false;
  registerForm!: FormGroup;

  termAccepted: boolean = false;
  isShowTerms: boolean = false;
  termsAndConditions = termsAndConditions;

  private router = inject(Router);
  private authSr = inject(AuthService);
  private vldtnSrv = inject(ValidationService);

  ngOnInit(): void {
    //TODO Traer las app para el select
    this.initForm(); 
  }

  private initForm(): void {
    this.registerForm = new FormGroup({
      num_empleado: new FormControl(null,[Validators.required,this.vldtnSrv.employeeNumber()]),
      nom_correo: new FormControl('',[Validators.required,this.vldtnSrv.emailCoppel()]),

      nom_usuario: new FormControl('',[Validators.required,]),
      nom_contrasena: new FormControl('',[Validators.required,]),
      confirmPassword: new FormControl('', Validators.required),
      termAccepted: new FormControl(false,[Validators.requiredTrue]),
      num_centro: new FormControl('',[Validators.required,]),
      nom_centro: new FormControl('',[Validators.required,]),
      nom_lider: new FormControl('',[Validators.required,]),
      nom_gerente: new FormControl('',[Validators.required,]),
      nom_gerentena: new FormControl('',[Validators.required,]),
      nom_gerentedi: new FormControl('',[Validators.required,]),
      idu_aplicacion: new FormControl('',[Validators.required,]),
    });
  }

  isValidField(field: string): boolean | null {
    return this.registerForm.controls[field].errors && this.registerForm.controls[field].touched;
  }

  onRegister(): void {

  }

  // onRegister(): void {
  //   const trimmedUsername = this.username.trim();
  //   const trimmedPassword = this.password.trim();
  //   const trimmedConfirmPassword = this.confirmPassword.trim();

  //   if (!/^(?=.*[A-ZÑ])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-zñÑ\d@$!%*?&#]{12,}$/.test(trimmedPassword)) {
  //     this.errorMessage = 'La contraseña debe tener al menos 12 caracteres, una letra mayúscula, un número y un carácter especial';
  //     return;
  //   }
    
  //   if (trimmedPassword !== trimmedConfirmPassword) {
  //     this.errorMessage = 'Las contraseñas no coinciden';
  //     return;
  //   }

  //   // Validación de nombre completo (al menos un nombre y dos apellidos con mayúsculas al principio)
  //   if (!/^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){2,}$/.test(trimmedUsername)) {
  //     this.errorMessage = 'Escribe nombre completo, con al menos un nombre y dos apellidos, todos comenzando con letra mayúscula, incluyendo acentos y ñ';
  //     return;
  //   }

  //   if(!this.termAccepted) {
  //     this.errorMessage = 'Debes aceptar los términos y condiciones';
  //     return;
  //   }

  //   this.isRegister = true;
  //   this.btnLabel = 'Registrando...';
  //   this.authService.registerUser(trimmedUsernumber, trimmedUsername, trimmedPassword, trimmedEmail)
  //     .pipe(
  //       finalize(() => this.btnLabel = 'Registrar')
  //     )
  //     .subscribe({
  //       next: () => {
  //         this.errorMessage = '';
  //         this.isReady = true;
  //       },
  //       error: (err) => {
  //         if (err.status === 0) {
  //           this.connectionErrorMessage = 'No se pudo conectar con el servidor.'; 
  //         } else {
  //           this.errorMessage = err.message || 'No se pudo conectar con el servidor. Favor de verificar.'; 
  //         }
  //         this.isRegister = false;
  //       }
  //     });
  // }

  // onInputChange(): void {
  //   this.errorMessage = '';
  // }

  showTerms(fromForm: boolean = false): void {
    if((fromForm && this.termAccepted) || !fromForm) {
      this.isShowTerms = !this.isShowTerms
    }
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  ngOnDestroy(): void{
    this.destroy$.next();
    this.destroy$.complete();
  }
}