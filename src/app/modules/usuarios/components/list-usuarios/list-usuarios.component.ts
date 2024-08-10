import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';

import { Usuario } from '@modules/shared/interfaces/usuario.interface';
import { UsuariosService } from '@modules/usuarios/services/usuarios.service';
import { elementPerPage } from '@modules/shared/helpers/dataPerPage';

@Component({
  selector: 'list-usuarios',
  standalone: true,
  imports: [TableModule, PaginatorModule,RouterLink,
    ConfirmDialogModule, PaginatorModule
    ,CommonModule,ProgressSpinnerModule,TooltipModule],
  templateUrl: './list-usuarios.component.html',
  styleUrl: './list-usuarios.component.scss',
  providers: [ConfirmationService],
})
export class ListUsuariosComponent implements OnInit {

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
  
  constructor(
    private usuariosService: UsuariosService,
    private router: Router,
    private confirmationService: ConfirmationService,
  ){}
   
  ngOnInit(): void {
    this.onGetUsuarios();
  }
  
  onGetUsuarios(): void{
    this.isLoading = true;
    this.usuariosService.getUsuarios(this.currentPage)
    .pipe(
      finalize(()=> this.isLoading = false),
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
    if(this.isDeleting) return;
    
    this.isDeleting = true; 
    this.idToDelete  = user.numero_empleado;
  
    const message = `¿Deseas eliminar al usuario ${user.numero_empleado}?`;
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
}
