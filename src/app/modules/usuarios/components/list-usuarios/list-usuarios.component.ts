import { Component, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { finalize, Subject, takeUntil } from 'rxjs';
import { FormsModule } from '@angular/forms';

import { ConfirmationService } from 'primeng/api';
import { Table, TablePageEvent } from 'primeng/table';

import { UsuariosService } from '@modules/usuarios/services/usuarios.service';
import { AuthService } from '@modules/auth/services/auth.service';
import { Usuario } from '@modules/usuarios/interfaces';
import { PrimeNGModule } from '@modules/shared/prime/prime.module';
import { RviaLoaderComponent } from '@modules/shared/components/loader/loader.component';

@Component({
    selector: 'list-usuarios',
    imports: [PrimeNGModule, RviaLoaderComponent, NgClass, FormsModule],
    templateUrl: './list-usuarios.component.html',
    styleUrls: ['./list-usuarios.component.scss'],
    providers: [ConfirmationService]
})
export class ListUsuariosComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  @ViewChild('usersTable') usersTable!: Table; 
  userLogged = signal<Usuario | null>(null);
  columns = signal<string[]>(['# Empleado', 'Nombre', 'Rol', 'Acciones']);
  allUsers: Usuario[] = [];

  isLoading  = signal<boolean>(true);
  isDeleting = signal<boolean>(false);
  idToDelete = signal<number>(-1);

  totalItems: number = 0;
  loadingDataPage: boolean = true;
  rowsPerPageOpts = signal<number[]>([]);
  rowsPerPage = signal<number>(0);
  cPage = signal<number>(0);
  filterValue: string = '';

  private usuariosService = inject(UsuariosService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.userLogged.set(this.authService.user());
    this.onGetUsuarios();
  }

  filtercustom(): void {
    this.usersTable.filterGlobal(this.filterValue, 'contains');
    this.usuariosService.dataPagination.update(
      data => ({...data, page: 0, filter: this.filterValue})
    );
  }
  
  onGetUsuarios(): void{
    this.isLoading.set(true);
    this.usuariosService.getUsuarios()
    .pipe(
      finalize(() => this.isLoading.set(false)),
      takeUntil(this.destroy$)
    )
    .subscribe({
      next: ({ data,total }) => {
        if (!data) return;
        this.loadingDataPage = true;
        this.allUsers = [...data];
        this.totalItems = total;
        this.setDataTable(); 
        if(this.filterValue) {
          setTimeout(() => this.filtercustom());
        }
        this.loadingDataPage = false;
      },
      error: () => {
        this.allUsers = [];
        this.totalItems = 0;
      }});  
  }

  private setDataTable(): void {
    this.rowsPerPageOpts.set(this.usuariosService.dataPagination().rowsPerPageOpts);
    this.rowsPerPage.set(this.usuariosService.dataPagination().rows);
    this.cPage.set(this.usuariosService.dataPagination().page * this.rowsPerPage());
    this.filterValue = this.usuariosService.dataPagination().filter;
  }

  onEdit(idUser: number): void{
    if(this.isDeleting()) return;

    this.usuariosService.setUserToEdit(idUser);
    this.router.navigate([`/users/edit/${idUser}`]);
  }

  onDeleteUsuario(user: Usuario): void{
    if(this.isDeleting() || user.idu_usuario === this.userLogged()?.idu_usuario) return;

    this.isDeleting.set(true); 
    this.idToDelete.set(user.num_empleado);
  
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
    this.isDeleting.set(false);
    this.idToDelete.set(-1);
  }

  pageChange(event: TablePageEvent): void {
    const page = (event.first / event.rows);
    const rows = event.rows;
    this.usuariosService.dataPagination.update(
      data => ({...data, page, rows, filter: this.filterValue})
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
