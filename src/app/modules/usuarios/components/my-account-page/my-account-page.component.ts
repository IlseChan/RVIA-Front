import { NgClass } from '@angular/common';
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '@modules/auth/services/auth.service';
import { PrimeNGModule } from '@modules/shared/prime/prime.module';
import { ValidationService } from '@modules/shared/services/validation.service';
import { Usuario, UsuarioCmplt } from '@modules/usuarios/interfaces';
import { UsuariosService } from '@modules/usuarios/services/usuarios.service';
import { InfoDisplayComponent } from "../info-display/info-display.component";
import { PositionValues } from '../../../auth/interfaces/PositionValues.enum';
import { RviaLoaderComponent } from '@modules/shared/components/loader/loader.component';
import { PasswordStrengthComponent } from '@modules/shared/components/password-strength/password-strength.component';

@Component({
    selector: 'my-account-page',
    imports: [PrimeNGModule, ReactiveFormsModule, NgClass, InfoDisplayComponent, RviaLoaderComponent, PasswordStrengthComponent],
    templateUrl: './my-account-page.component.html',
    styleUrl: './my-account-page.component.scss'
})
export class MyAccountPageComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private destroy$ = new Subject<void>();
  private usuariosSrvc = inject(UsuariosService);
  private authSrvc = inject(AuthService);
  private vldtnSrv = inject(ValidationService);
  private fb = inject(FormBuilder);
  
  positionValues = PositionValues
  isLoading = signal(true);  
  isUpdate = signal(false);  
  originalUser = computed(() => this.authSrvc.user());
  fullUser = signal<UsuarioCmplt | null>(null);
  tabs: string[] = ['Personal','Contraseña','Organización'];

  codeForm!: FormGroup;
  personalForm!: FormGroup;
  initalValuesPersonal = {
    nom_usuario: this.originalUser()!.nom_usuario,
  };

  ngOnInit(): void {
    if(!this.originalUser) this.authSrvc.logoutUser();
    this.usuariosSrvc.getUsuarioById(this.originalUser()!.idu_usuario)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (user) => {
        this.fullUser.set(user);
        this.initForms(user);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.back();
      }
    });
  }
  
  initForms(user: Usuario): void {
    this.personalForm = this.fb.group({
      nom_usuario: [user.nom_usuario,[
        Validators.required,
        this.vldtnSrv.noBlankValidation(),
        this.vldtnSrv.completeUserName()
      ]],
    });
    
    this.codeForm = this.fb.group({
      prevCode: [null,[Validators.required, this.vldtnSrv.passwordValidation()]],
      newCode: [null,[Validators.required, this.vldtnSrv.passwordValidation()]],
      newCodeConf: [null,[Validators.required]],
    },{
      validators: [
        this.vldtnSrv.passwordMatch('newCode', 'newCodeConf'),
        this.vldtnSrv.sameCode('prevCode', 'newCode')
      ]
    });

    this.initalValuesPersonal = this.personalForm.value;
  }

  onSubmit(): void {
    if(this.isUpdate()) return;
    
    let changes;
    
    if(this.personalForm.invalid){
      this.personalForm.markAllAsTouched();
      return;
    }

    this.isUpdate.set(true);
    changes = this.personalForm.value;

    this.usuariosSrvc.updateUsuario(this.originalUser()!,changes)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newUser) => {
          this.isUpdate.set(false);
          this.authSrvc.setUser(newUser);
          this.initForms(newUser);
        },
        error: (e) => {
          this.isUpdate.set(false);
        }
      });
  }

  onSubmitCode(): void {
    if(this.isUpdate()) return;
    
    let changes;
    
    if(this.codeForm.invalid){
      this.codeForm.markAllAsTouched();
      return;
    }

    this.isUpdate.set(true);
    changes = this.codeForm.value;

    const infoToSend = {
      nom_contrasena: changes.newCode,
    }

    this.usuariosSrvc.changePassword(infoToSend)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isUpdate.set(false);
          this.onCancel('C');
        },
        error: (e) => {
          this.isUpdate.set(false);
        }
      });
  }

  isValidField(field: string): boolean | null {
    return this.personalForm.controls[field].errors && this.personalForm.controls[field].touched;
  }

  isValidFieldCode(field: string): boolean | null {
    return this.codeForm.controls[field].errors && this.codeForm.controls[field].touched;
  }

  get hasFormChanges(): boolean {
    return JSON.stringify(this.personalForm.value) !== JSON.stringify(this.initalValuesPersonal);
  }

  get centerName(): string {
    return `${this.fullUser()?.centro?.num_centro} - ${this.fullUser()?.centro?.nom_centro}`
  }

  onCancel(value: 'P' | 'C'): void {
    if(value === 'P'){
      this.personalForm.reset(this.initalValuesPersonal);
      return;
    }

    if(value === 'C'){
      this.codeForm.reset();
      return;
    }
      
  }

  back(): void {
    this.router.navigate(['/apps/list-apps'],{ replaceUrl: true });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
