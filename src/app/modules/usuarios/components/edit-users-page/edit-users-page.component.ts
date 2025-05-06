import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, switchMap, takeUntil } from 'rxjs';

import { UsuariosService } from '@modules/usuarios/services/usuarios.service';
import { ValidationService } from '@modules/shared/services/validation.service';
import { Idu_Rol, Nom_Rol, Usuario } from '@modules/usuarios/interfaces';
import { PrimeNGModule } from '@modules/shared/prime/prime.module';

@Component({
  selector: 'edit-users-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PrimeNGModule],
  templateUrl: './edit-users-page.component.html',
  styleUrls: ['./edit-users-page.component.scss'],
})
export class EditUsersPageComponent implements OnInit, OnDestroy {
  userForm!:  FormGroup;
  initalValues = {
    nom_usuario: '',
    idu_rol: Idu_Rol.INVITADO
  };
  
  isLoading: boolean = true;
  typesUsers = [
    { idu_usuario: Idu_Rol.ADMINISTRADOR, nom_rol: Nom_Rol.ADMINISTRADOR },
    { idu_usuario: Idu_Rol.AUTORIZADOR, nom_rol: Nom_Rol.AUTORIZADOR },
    { idu_usuario: Idu_Rol.USUARIO, nom_rol: Nom_Rol.USUARIO },
    { idu_usuario: Idu_Rol.INVITADO, nom_rol: Nom_Rol.INVITADO },
  ];

  isUpdate: boolean = false;
  originalUser =  signal<Usuario|null>(null) ;
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private usuariosService: UsuariosService,
    private vldtnSrv: ValidationService,
    private activedRoute: ActivatedRoute
  ){}

  ngOnInit(): void {
    if(!this.router.url.includes('edit')) return;

    this.activedRoute.params  
      .pipe(
        switchMap(({id}) => this.usuariosService.getUsuarioById(+id)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (user) => {
          this.initForm(user); 
          this.originalUser.set(user);
          this.isLoading = false; 
        },
        error: () => {
          this.back();
        }
      });  
  }
  
  initForm(user: Usuario): void {
    this.userForm = new FormGroup({
      nom_usuario: new FormControl<string>(user.nom_usuario,[
        Validators.required,
        this.vldtnSrv.noBlankValidation(),
        this.vldtnSrv.completeUserName()
      ]),
      idu_rol: new FormControl<Idu_Rol>(user.position.idu_rol,[Validators.required])
    });
  
    this.initalValues = this.userForm.value;
  }

  isValidField(field: string): boolean | null {
    return this.userForm.controls[field].errors && this.userForm.controls[field].touched;
  }

  get hasFormChanges(): boolean {
    return JSON.stringify(this.userForm.value) !== JSON.stringify(this.initalValues);
  }

  onSubmit(): void{
    if(this.userForm.invalid){
      this.userForm.markAllAsTouched();
      return;
    }

    const trimName = this.userForm.get('nom_usuario')?.value.trim();
    this.userForm.get('nom_usuario')?.setValue(trimName);

    this.isUpdate = true;
    const user = this.userForm.value;
        
    this.usuariosService.updateUsuario(this.originalUser()!,user)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.back();
        },
        error: () => {
          this.isUpdate = false;
        }
      });
  }

  onCancel(): void{
    this.userForm.reset(this.initalValues);
  }

  back(): void {
    this.router.navigate(['users/list-users'],{ replaceUrl: true });
  }

  ngOnDestroy(): void{
    this.destroy$.next();
    this.destroy$.complete();
  }
}


