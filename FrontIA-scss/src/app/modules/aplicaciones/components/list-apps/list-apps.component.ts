import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';

import { Aplication } from '@modules/aplicaciones/interfaces/aplicaciones.interfaces';
import { AplicacionesService } from '@modules/aplicaciones/services/aplicaciones.service';
import { UserLogged } from '@modules/auth/interfaces/userLogged.interface';
import { AuthService } from '@modules/auth/services/auth.service';
import { StatusAppPipe } from "../../pipes/status-app.pipe";
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@Component({
  selector: 'list-apps',
  standalone: true,
  imports: [ButtonModule, TableModule, CommonModule, PaginatorModule, StatusAppPipe,RouterLink,DropdownModule,ConfirmDialogModule],
  templateUrl: './list-apps.component.html',
  styleUrl: './list-apps.component.scss',
  providers: [ConfirmationService],
})
export class ListAppsComponent implements OnInit {
  user!: UserLogged | null;
  aplications: Aplication[] = [];
  
  currentPage: number = 1;
  totalItems: number = 0;

  colums: string[] = ['ID','Nombre','Estatus'];

  statusOpcs = [
    { name: 'En proceso', code : 2 },
    { name: 'Rechazado',  code : 3 },
    { name: 'En espera',  code : 4 },
  ];

  constructor(
    private aplicacionService: AplicacionesService,
    private authService: AuthService,
    private confirmationService: ConfirmationService ){}
  
  ngOnInit(): void {
    this.user = this.authService.userLogged;
    this.setColumns();
    this.onGetAplicaciones();
  }

  setColumns():void {
    if(this.user && this.user.rol !== 'Invitado'){
      this.colums.push('Acciones');

      if(this.user.rol !== 'Usuario'){
        this.colums.splice(2,0,'Usuario');
      }
    }
  }

  onGetAplicaciones(): void {
    this.aplicacionService.getAplicaciones(this.currentPage)
    .subscribe(({data,total}) => {
      this.aplications = [...data];
      this.totalItems  = total;
    });
  }

  onChangeStatus({value}: DropdownChangeEvent, app: Aplication, index: number){
    if(value === 3){
      this.dialogConfirmation(app,index,value);
    }else{
      this.aplicacionService.setNewStatus({...app},value)
        .subscribe( resp => {
          this.updateValue(value,index);
        })
    }
  }

  updateValue(value: number, index:number): void{ 
    const temp = { ... this.aplications[index] };
    temp.status = value;

    this.aplications[index] = {...temp};
  }

  dialogConfirmation(app: Aplication, index: number, newValue: number){
    const message = `¿Deseas rechazar la aplicación ${app.name}?`;
    this.confirmationService.confirm({
      message,
      header: 'Confirmación de rechazo',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      acceptLabel: 'Sí, rechazar',
      rejectLabel: 'No, cancelar',
      accept: () => {
        this.aplicacionService.setNewStatus({...app},newValue)
          .subscribe( resp => {
            this.updateValue(newValue,index);
          })
      },
      reject: () => {
        this.updateValue(app.status,index);
      }
    });
  }

  onPageChange({ page = 0 }: PaginatorState) {
    const newPage = page + 1;
    if(newPage === this.currentPage) return;
    this.currentPage = newPage;
    this.onGetAplicaciones(); 
  }
}
