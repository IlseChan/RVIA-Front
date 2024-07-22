import { NgClass, NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';

import { Usuario } from '@modules/usuarios/interfaces/usuario.interface';
import { UsuariosService } from '@modules/usuarios/services/usuarios.service';

@Component({
  selector: 'app-list-usuarios',
  standalone: true,
  imports: [TableModule,NgFor, PaginatorModule,RouterLink,ConfirmDialogModule, NgClass,ToastModule,PaginatorModule],
  templateUrl: './list-usuarios.component.html',
  styleUrl: './list-usuarios.component.scss',
  providers: [ConfirmationService,MessageService],
})
export class ListUsuariosComponent implements OnInit {

  users: Usuario[] = [];
  columns: string[] = [
    '# Empleado', 'Nombre', 'Rol', 'Acciones'
  ];

  isDeleting: boolean = false;
  idToDelete: string = '';

  currentPage: number = 1;
  totalItems: number = 0;

  constructor(
    private usuariosService: UsuariosService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService 
  ){}
   
  ngOnInit(): void {
    this.onGetUsuarios();
  }
  
  onGetUsuarios(): void{
    this.usuariosService.getUsuarios(this.currentPage).subscribe(({data,total}) => {
      this.users = data;
      this.totalItems  = total;
      console.log(this.totalItems);
      
    });  
  }

  onEdit(idUser: string): void{
    if(this.isDeleting) return;
    this.router.navigate([`/apps/users/edit/${idUser}`]);
  }

  onDeleteUsuario(user: Usuario){
    if(this.isDeleting) return;
    this.isDeleting = true;
    this.idToDelete  = user.usernumber;

    const message = `¿Deseas eliminar al usuario ${user.username}?`;
    this.confirmationService.confirm({
      message,
      header: 'Eliminar usuario',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'No, cancelar',
      accept: () => {
        this.usuariosService.deleteUsuario(user.usernumber)
          .subscribe((resp) => {
            this.messageService.add(
              { severity: 'success', 
                summary: 'Usuario eliminado', 
                detail: `El usuario ${user.usernumber} se elimino exitosamente` 
              });
            this.resetValues();
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
    this.idToDelete = '';
  }

  onPageChange({ page = 0 }: PaginatorState): void {
    const newPage = page + 1;
    if(newPage === this.currentPage) return;
    this.currentPage = newPage;
    this.onGetUsuarios();    
  }
}
