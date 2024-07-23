import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Role, Usuario } from '@modules/usuarios/interfaces/usuario.interface';
import { UsuariosService } from '@modules/usuarios/services/usuarios.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { switchMap } from 'rxjs';

@Component({
  selector: 'edit-users-page',
  standalone: true,
  imports: [CommonModule, InputTextModule, DropdownModule, ButtonModule, DropdownModule,ReactiveFormsModule,ToastModule],
  templateUrl: './edit-users-page.component.html',
  styleUrl: './edit-users-page.component.scss',
  providers: [MessageService]
})
export class EditUsersPageComponent implements OnInit {
  userForm!:  FormGroup;
  initalValues: any;
  
  isLoading: boolean = false;
  typesUsers = [
    { code: 'Invitado',      name: 'Invitado' },
    { code: 'Usuario',       name: 'Usuario' },
    { code: 'Autorizador',   name: 'Autorizador' },
    { code: 'Administrador', name: 'Administrador' },
  ];

  constructor(
    private router: Router,
    private usuariosService: UsuariosService,
    private activedRoute: ActivatedRoute,
    private messageService: MessageService 
  ){}

  ngOnInit(): void {
    if(!this.router.url.includes('edit')) return;

    this.activedRoute.params  
      .pipe(
        switchMap(({id}) => this.usuariosService.getUsuarioById(id))
      )
      .subscribe( user => {
        if(!user){
          this.router.navigate(['/apps/users/list-users']);
        }
        this.initForm(user!);
      });
  }

  
  initForm(user: Usuario): void {
    this.userForm = new FormGroup({
      usernumber: new FormControl<string>('', [Validators.required, Validators.minLength(3), this.isValidUserNumber]),
      username: new FormControl<string>('',[Validators.required, Validators.minLength(3)]),
      rol: new FormControl<Role>(Role.INVITADO,[Validators.required])
    });
  
    this.userForm.reset(user);
    this.initalValues = this.userForm.value;
  }

  isValidField(field: string): boolean | null {
    return this.userForm.controls[field].errors && this.userForm.controls[field].touched;
  }

  isValidUserNumber(control: FormControl): ValidationErrors | null {
    const value = control.value?.trim();
    const isNumeric = /^[0-9]+$/.test(value);
    
    return isNumeric ? null : { noNumeric: true }
  }

  get hasFormChanges(): boolean {
    return JSON.stringify(this.userForm.value) !== JSON.stringify(this.initalValues);
  }

  onSubmit(): void{
    if(this.userForm.invalid){
      this.userForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const user = this.userForm.value;
    this.usuariosService.updateUsuario(user)
    .subscribe( resp => {
      this.isLoading = false;
      this.messageService.add(
        { severity: 'success', 
          summary: 'Usuario actualizado', 
          detail: `¡Se a modificado a ${resp.user.username} como ${resp.user.rol} con éxito!` 
        });
      this.initalValues = this.userForm.value;
    });
  }

  onCancel(): void{
    this.userForm.reset(this.initalValues);
  }
}


