import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { finalize, Subject, takeUntil } from 'rxjs';

import { ConfirmationService } from 'primeng/api';
import { PaginatorState } from 'primeng/paginator';

import { UsuariosService } from '@modules/usuarios/services/usuarios.service';
import { elementPerPage } from '@modules/shared/helpers/dataPerPage';
import { AuthService } from '@modules/auth/services/auth.service';
import { Usuario } from '@modules/usuarios/interfaces';
import { PrimeNGModule } from '@modules/shared/prime/prime.module';

@Component({
  selector: 'list-usuarios',
  standalone: true,
  imports: [RouterLink, CommonModule, PrimeNGModule],
  templateUrl: './list-usuarios.component.html',
  styleUrls: ['./list-usuarios.component.scss'],
  providers: [ConfirmationService],
})
export class ListUsuariosComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  users: Usuario[] = [];
  columns: string[] = [
    '# Empleado', 'Nombre', 'Rol', 'Acciones'
  ];

  isLoading: boolean= true;
  
  isDeleting: boolean = false;
  idToDelete: number = -1;

  currentPage: number = 1;
  totalItems: number = 0;
  elementPerPage:number = elementPerPage;

  userLogged!: Usuario | null;
  constructor(
    private usuariosService: UsuariosService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private authService: AuthService
  ){}
   
  ngOnInit(): void {
    this.userLogged = this.authService.userLogged;
    this.onGetUsuarios();
  }
  
  onGetUsuarios(): void{
    this.isLoading = true;
    this.usuariosService.getUsuarios(this.currentPage)
    .pipe(
      finalize(()=> this.isLoading = false),
      takeUntil(this.destroy$)
    )
    .subscribe({
      next: ({data,total}) => {
        this.users = data;
        this.totalItems = total;
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
    if(this.isDeleting || user.idu_usuario === this.userLogged?.idu_usuario) return;

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
      accept: () => {
        this.usuariosService.deleteUsuario(user)
          .pipe(
            finalize(() => this.resetValues()),
            takeUntil(this.destroy$)
          )
          .subscribe(() => {
            this.currentPage = 1;
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

  onPageChange({ page = 0 }: PaginatorState): void {
    const newPage = page + 1;
    if(newPage === this.currentPage) return;
    this.currentPage = newPage;
    this.onGetUsuarios();    
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
