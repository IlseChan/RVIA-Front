import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { TableModule } from 'primeng/table';

import { Aplication } from '@modules/aplicaciones/interfaces/aplicaciones.interfaces';
import { AplicacionesService } from '@modules/aplicaciones/services/aplicaciones.service';
import { UserLogged } from '@modules/auth/interfaces/userLogged.interface';
import { AuthService } from '@modules/auth/services/auth.service';
import { StatusAppPipe } from "../../pipes/status-app.pipe";
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { Nom_Puesto } from '@modules/usuarios/interfaces/usuario.interface';

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
    { name: 'En proceso', code : 1 },
    { name: 'En espera',  code : 2 },
    { name: 'Rechazado',  code : 4 },
  ];

  isLoading: boolean = true;
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
    if(this.user && this.user.position.nom_puesto !== Nom_Puesto.INVITADO){
      this.colums.push('Acciones');

      if(this.user.position.nom_puesto !== Nom_Puesto.USUARIO){
        this.colums.splice(2,0,'Usuario');
      }
    }
  }

  onGetAplicaciones(): void {
    this.aplicacionService.getAplicaciones(this.currentPage)
    .subscribe(({data, total}) => {
      if(!data) return
      this.aplications = [...data];
      this.totalItems  = total;
    });
  }

  onChangeStatus({value}: DropdownChangeEvent, app: Aplication, index: number){
    if(value === 4){
      this.dialogConfirmation(app,index,value);
    }else{
      this.aplicacionService.setNewStatus({...app},value)
        .subscribe( resp => {});
    }
  }

  updateValue(value: number, index:number): void{ 
    const temp = { ... this.aplications[index] };
    // temp.status = value;

    this.aplications[index] = {...temp};
  }

  dialogConfirmation(app: Aplication, index: number, newValue: number){
    const message = `¿Deseas rechazar la aplicación ${app.nom_aplicacion}?`;
    this.confirmationService.confirm({
      message,
      header: 'Confirmación de rechazo',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      acceptLabel: 'Sí, rechazar',
      rejectLabel: 'No, cancelar',
      accept: () => {
        this.aplicacionService.setNewStatus({...app},newValue)
          .subscribe()
      },
      reject: () => {
        this.updateValue(app.applicationstatus.idu_estatus_aplicacion,index);
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
