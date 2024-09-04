import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, switchMap } from 'rxjs';

import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';

import { UsuariosService } from '@modules/usuarios/services/usuarios.service';
import { Idu_Rol, Usuario } from '@modules/shared/interfaces/usuario.interface';
import { ValidationService } from '@modules/shared/services/validation.service';

@Component({
  selector: 'edit-users-page',
  standalone: true,
  imports: [CommonModule, InputTextModule, DropdownModule, 
    ButtonModule, DropdownModule,ReactiveFormsModule, ProgressSpinnerModule],
  templateUrl: './edit-users-page.component.html',
  styleUrl: './edit-users-page.component.scss',
})
export class EditUsersPageComponent implements OnInit, OnDestroy {
  userForm!:  FormGroup;
  initalValues = {
    nom_usuario: '',
    idu_rol: Idu_Rol.INVITADO
  };
  
  isLoading: boolean = true;
  typesUsers = [
    { idu_usuario: 1, nom_rol: 'Administrador' },
    { idu_usuario: 2, nom_rol: 'Autorizador' },
    { idu_usuario: 3, nom_rol: 'Usuario' },
    { idu_usuario: 4, nom_rol: 'Invitado' },
  ];

  userSub!: Subscription;
  isUpdate: boolean = false;
  originalUser!: Usuario;

  constructor(
    private router: Router,
    private usuariosService: UsuariosService,
    private vldtnSrv: ValidationService,
    private activedRoute: ActivatedRoute
  ){}

  ngOnInit(): void {
    if(!this.router.url.includes('edit')) return;

    this.userSub = this.activedRoute.params  
      .pipe(
        switchMap(({id}) => this.usuariosService.getUsuarioById(+id)),
      )
      .subscribe({
        next: (user) => {
          this.initForm(user); 
          this.originalUser = user;
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
        
    this.usuariosService.updateUsuario(this.originalUser,user)
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

  back(): void{
    this.router.navigate(['users/list-users'],{ replaceUrl: true });
  }

  ngOnDestroy(): void{
    if(this.userSub) this.userSub.unsubscribe();
  }
}


