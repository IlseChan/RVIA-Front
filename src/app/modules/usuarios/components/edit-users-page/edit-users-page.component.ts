import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, Subscription, switchMap, throwError } from 'rxjs';

import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';

import { UsuariosService } from '@modules/usuarios/services/usuarios.service';
import { Idu_Puesto, Usuario } from '@modules/shared/interfaces/usuario.interface';
import { InitalValuesFormEdits } from '@modules/usuarios/interfaces/usuarios.interface';

@Component({
  selector: 'edit-users-page',
  standalone: true,
  imports: [CommonModule, InputTextModule, DropdownModule, 
    ButtonModule, DropdownModule,ReactiveFormsModule,
    ToastModule,ProgressSpinnerModule],
  templateUrl: './edit-users-page.component.html',
  styleUrl: './edit-users-page.component.scss',
  providers: [MessageService]
})
export class EditUsersPageComponent implements OnInit, OnDestroy {
  userForm!:  FormGroup;
  initalValues: InitalValuesFormEdits = {
    nom_usuario: '',
    idu_puesto: Idu_Puesto.INVITADO
  };
  
  isLoading: boolean = true;
  typesUsers = [
    { idu_usuario: 1, nom_puesto: 'Administrador' },
    { idu_usuario: 2, nom_puesto: 'Autorizador' },
    { idu_usuario: 3, nom_puesto: 'Usuario' },
    { idu_usuario: 4, nom_puesto: 'Invitado' },
  ];

  userSub!: Subscription;
  isUpdate: boolean = false;
  originalUser!: Usuario;

  constructor(
    private router: Router,
    private usuariosService: UsuariosService,
    private activedRoute: ActivatedRoute,
    private messageService: MessageService 
  ){}

  ngOnInit(): void {
    if(!this.router.url.includes('edit')) return;

    this.userSub = this.activedRoute.params  
      .pipe(
        switchMap(({id}) => this.usuariosService.getUsuarioById(+id)),
        catchError(e => throwError(() => {})),
      )
      .subscribe({
        next: (user) => {
          this.initForm(user); 
          this.originalUser = user;
          this.isLoading = false; 
        },
        error: (e) => {
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: `Error al cargar información` 
          });
          setTimeout(() => {
            this.router.navigate(['users/list-users'])
          }, 2800);
        }
      });  
  }
  
  initForm(user: Usuario): void {
    this.userForm = new FormGroup({
      nom_usuario: new FormControl<string>(user.nom_usuario,[Validators.required, Validators.minLength(3)]),
      idu_puesto: new FormControl<Idu_Puesto>(user.position.idu_puesto,[Validators.required])
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

    this.isUpdate = true;
    const user = this.userForm.value;
        
    this.usuariosService.updateUsuario(this.originalUser,user)
      .pipe(
        catchError(e =>  throwError(() => e)),
      )
      .subscribe({
        next: (resp) => {
          this.messageService.add({ 
            severity: 'success', 
            summary: 'Actualización Exitosa', 
            detail: `El usuario ${resp.numero_empleado} - ${resp.nom_usuario} con posición ${resp.position.nom_puesto} se actualizó correctamente` 
          });
          setTimeout(() => {
            this.router.navigate(['users/list-users'],{ replaceUrl: true });
            this.usuariosService.userEditSubject.next(null);
          },2800)
        },
        error: (e) => {
          const detail = `Error al actualizar al usaurio. ${e.error.message}`;
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Error al actualizar', 
            detail
          });
          this.isUpdate = false;
        }
      });
  }

  onCancel(): void{
    this.userForm.reset(this.initalValues);
  }

  back():void {
    this.router.navigate(['users/list-users'],{ replaceUrl: true });
  }

  ngOnDestroy(): void {
    if(this.userSub) this.userSub.unsubscribe();
  }
}


