import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize, Subject, takeUntil } from 'rxjs';

import { ConfirmationService } from 'primeng/api';

import { UsuariosService } from '@modules/usuarios/services/usuarios.service';
import { AuthService } from '@modules/auth/services/auth.service';
import { Usuario } from '@modules/usuarios/interfaces';
import { PrimeNGModule } from '@modules/shared/prime/prime.module';

@Component({
  selector: 'list-usuarios',
  standalone: true,
  imports: [CommonModule, PrimeNGModule],
  templateUrl: './list-usuarios.component.html',
  styleUrls: ['./list-usuarios.component.scss'],
  providers: [ConfirmationService],
})
export class ListUsuariosComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  allUsers: Usuario[] = [];
  users: Usuario[] = [];
  columns: string[] = [
    '# Empleado', 'Nombre', 'Rol', 'Acciones'
  ];

  isLoading: boolean= true;
  
  isDeleting: boolean = false;
  idToDelete: number = -1;

  totalItems: number = 0;
  loadingDataPage: boolean = true;
  rowsPerPageOpts: number[] = [10,15,20];

  userLogged = signal<Usuario | null>(null);
  constructor(
    private usuariosService: UsuariosService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private authService: AuthService
  ){}
   
  ngOnInit(): void {
    this.userLogged.set(this.authService.user());
    this.onGetUsuarios();
  }
  
  onGetUsuarios(): void{
    this.isLoading = true;
    this.usuariosService.getUsuarios()
    .pipe(
      finalize(()=> this.isLoading = false),
      takeUntil(this.destroy$)
    )
    .subscribe({
      next: ({data,total}) => {
        if (!data) return;
        this.allUsers = [...data];
        this.totalItems = total;
        this.loadData({ first: 0, rows: 10});
      },
      error: () => {
        this.users = [];
        this.totalItems  = 0;
      }});  
  }

  onEdit(idUser: number): void{
    if(this.isDeleting) return;
    this.usuariosService.setUserToEdit(idUser);
    this.router.navigate([`/users/edit/${idUser}`]);
  }

  onDeleteUsuario(user: Usuario): void{
    if(this.isDeleting || user.idu_usuario === this.userLogged()?.idu_usuario) return;

    this.isDeleting = true; 
    this.idToDelete  = user.num_empleado;
  
    const message = `¿Deseas eliminar al usuario ${user.num_empleado}?`;
    this.confirmationService.confirm({
      message,
      header: 'Eliminar usuario',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger my-2',
      acceptLabel: 'Sí, eliminar',
      rejectButtonStyleClass: 'p-button-outlined my-2',
      rejectLabel: 'No, cancelar',
      closable: false,
      accept: () => {
        this.usuariosService.deleteUsuario(user)
          .pipe(
            finalize(() => this.resetValues()),
            takeUntil(this.destroy$)
          )
          .subscribe(() => {
            this.onGetUsuarios();
          });
      },
      reject: () => {
        this.resetValues();
      }
    });
  }

  resetValues(): void {
    this.isDeleting = false;
    this.idToDelete = -1;
  }

  loadData(event: any) {
    this.loadingDataPage = true;
    const start = event.first;
    const end = event.first + event.rows;
    this.users = this.allUsers.slice(start,end);
    this.loadingDataPage = false;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
