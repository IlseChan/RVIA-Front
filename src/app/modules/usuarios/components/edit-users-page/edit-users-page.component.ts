import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { pipe, Subject, switchMap, takeUntil } from 'rxjs';

import { UsuariosService } from '@modules/usuarios/services/usuarios.service';
import { Idu_Rol, Nom_Rol, Usuario } from '@modules/usuarios/interfaces';
import { PrimeNGModule } from '@modules/shared/prime/prime.module';
import { AuthService } from '@modules/auth/services/auth.service';
import { AppOrg, InfoOrg, Position, PositionValues } from '@modules/auth/interfaces';

@Component({
  selector: 'edit-users-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PrimeNGModule],
  templateUrl: './edit-users-page.component.html',
  styleUrls: ['./edit-users-page.component.scss'],
})
export class EditUsersPageComponent implements OnInit, OnDestroy {
  
  private destroy$ = new Subject<void>();
  private router = inject(Router);
  private usuariosSrvc = inject(UsuariosService);
  private fb = inject(FormBuilder);

  isLoading = signal(true);
  isUpdate  = signal(false);
  originalUser =  signal<Usuario|null>(null) ;
  isDivisional = signal(false);
  
  positions = computed(() => this.usuariosSrvc.cachePositions());
  infoOrg = computed(() => this.usuariosSrvc.cacheInfoOrg());
  txtPosition = signal<string>('');

  personalForm!: FormGroup;
  initalValuesPersonal = {
    idu_rol: Idu_Rol.INVITADO
  };
  organizationForm!: FormGroup;
  initalValuesOrganization = {
    num_puesto: null, 
    idu_aplicacion: null,
    num_centro: null,
    num_encargado: null
  }
  
  typesUsers = [
    { idu_usuario: Idu_Rol.ADMINISTRADOR, nom_rol: Nom_Rol.ADMINISTRADOR },
    { idu_usuario: Idu_Rol.AUTORIZADOR, nom_rol: Nom_Rol.AUTORIZADOR },
    { idu_usuario: Idu_Rol.USUARIO, nom_rol: Nom_Rol.USUARIO },
    { idu_usuario: Idu_Rol.INVITADO, nom_rol: Nom_Rol.INVITADO },
  ];

  ngOnInit(): void {
    if(!this.router.url.includes('edit')) return;
    
    if(!this.usuariosSrvc.userToEdit()){
      this.back();
      return;
    }

    this.originalUser.set(this.usuariosSrvc.userToEdit());
    console.log(this.originalUser());  

    this.usuariosSrvc.getInfoOrg(this.originalUser()?.num_puesto!)
    .pipe(
      takeUntil(this.destroy$),
      switchMap((_) => this.usuariosSrvc.getPositions())
    )
    .subscribe({
      next: (_) => {

        this.initForms(this.originalUser()!);

        this.isDivisional.set(this.originalUser()?.num_puesto === PositionValues.DIVISIONAL);
        this.isLoading.set(false);
        this.updateTextManager(this.originalUser()?.num_puesto!);
        this.getManagers(this.originalUser()?.num_puesto!);


      },
      error: () => {
        this.back();
      }
    });

  }
  
  initForms(user: Usuario): void {
    this.personalForm = this.fb.group({
      idu_rol: [user.position.idu_rol,[Validators.required]]
    });
  
    this.organizationForm = this.fb.group({
      num_puesto: [user.num_puesto,[Validators.required]],
      idu_aplicacion: [user.idu_aplicacion,[Validators.required]],
      num_centro: [user.num_centro,[Validators.required]],
      num_encargado: [user.num_encargado]
    });

    this.initalValuesPersonal = this.personalForm.value;
    this.initalValuesOrganization = this.organizationForm.value;

    this.organizationForm.get('num_puesto')?.valueChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe((value) => {
      if (value && value !== PositionValues.DIVISIONAL) {
        this.isDivisional.set(false);
        this.getManagers(value);
        this.updateTextManager(value);
        this.updateGerenteValidator(value);
        this.organizationForm.patchValue({ num_encargado: null });
      }else {
        this.isDivisional.set(true);
        this.organizationForm.patchValue({ num_encargado: null });
        
      }

    });
  }

  isValidField(field: string): boolean | null {
    return this.personalForm.controls[field].errors && this.personalForm.controls[field].touched;
  }

  isValidFieldOrg(field: string): boolean | null {
    return this.organizationForm.controls[field].errors && this.organizationForm.controls[field].touched;
  }

  get hasFormChanges(): boolean {
    return JSON.stringify(this.personalForm.value) !== JSON.stringify(this.initalValuesPersonal);
  }

  get hasFormChangesOrg(): boolean {
    return JSON.stringify(this.organizationForm.value) !== JSON.stringify(this.initalValuesOrganization);
  }

  updateTextManager(value: number){
    const position = this.positions().find((pos) => pos.idu_puesto === value - 1);
    this.txtPosition.set(position ? position.nom_puesto : 'ERRORR');
  }

  updateGerenteValidator(positionValue: number): void {
    const control = this.organizationForm.get('num_encargado');
    if (!control) return;
  
    if (positionValue !== PositionValues.DIVISIONAL) {
      control.setValidators([Validators.required]);
    } else {
      control.clearValidators();
    }
    
    control.updateValueAndValidity();
  }

  onSubmit(opc: 'P' | 'O'): void {
    let changes;

    if(opc === 'P'){
      if(this.personalForm.invalid){
        this.personalForm.markAllAsTouched();
        return;
      }
  
      this.isUpdate.set(true);
      changes = this.personalForm.value;
    }else if(opc === 'O'){
      if(this.organizationForm.invalid){
        this.organizationForm.markAllAsTouched();
        return;
      }
  
      this.isUpdate.set(true);
      changes = this.organizationForm.value;

      if(changes.num_puesto === PositionValues.DIVISIONAL) {
        let { num_encargado, ...rest } = changes;
        changes = {...rest}
      }

    }
        
    console.log(changes);
    this.usuariosSrvc.updateUsuario(this.originalUser()!,changes)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.back();
        },
        error: (e) => {
          console.log(e);
          this.isUpdate.set(false);
        }
      });
  }

  getManagers(value: PositionValues){
    console.log(value);
    this.usuariosSrvc.getManagers(value)
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => {});
  }

  onCancel(value: 'P' | 'O'): void {
    if(value === 'P'){
      this.personalForm.reset(this.initalValuesPersonal);
      return;
    }

    if(value === 'O'){
      this.organizationForm.reset(this.initalValuesOrganization);
    }
  }

  back(): void {
    this.router.navigate(['users/list-users'],{ replaceUrl: true });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}


