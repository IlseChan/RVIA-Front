import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { Aplication } from '@modules/aplicaciones/interfaces/aplicaciones.interfaces';
import { AplicacionesService } from '@modules/aplicaciones/services/aplicaciones.service';
import { UserLogged } from '@modules/auth/interfaces/userLogged.interface';
import { AuthService } from '@modules/auth/services/auth.service';
import { Nom_Puesto } from '@modules/usuarios/interfaces/usuario.interface';
import { StatusAppPipe } from "../../pipes/status-app.pipe";
import { ToastModule } from 'primeng/toast';
import { catchError, throwError } from 'rxjs';

@Component({
  selector: 'list-apps',
  standalone: true,
  imports: [ButtonModule, TableModule, CommonModule, 
    PaginatorModule, StatusAppPipe,RouterLink,
    DropdownModule,ConfirmDialogModule,ProgressSpinnerModule,ToastModule ],
  templateUrl: './list-apps.component.html',
  styleUrl: './list-apps.component.scss',
  providers: [ConfirmationService, MessageService],
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
  isChangeStatus: boolean = false;
  indexChange: number = -1;

  constructor(
    private aplicacionService: AplicacionesService,
    private authService: AuthService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService 
  ){}
  
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
    this.isLoading = true;
    this.aplicacionService.getAplicaciones(this.currentPage)
    .subscribe(({data, total}) => {
      if(!data) return
      this.aplications = [...data];
      this.totalItems  = total;
      this.isLoading = false;
    });
  }

  onChangeStatus({value}: DropdownChangeEvent, app: Aplication, index: number){
    if(this.isChangeStatus) return;
    
    this.isChangeStatus = true;
    if(value === 4){
      this.dialogConfirmation(app,index,value);
    }else{
      this.aplicacionService.setNewStatus({...app},value).
      pipe(
        catchError(e => throwError(() => ({ error: true })))
      )
      .subscribe({ 
        next: (appUp) => {
          if(appUp){
            this.showMessage(appUp,'success');
            this.updateValue(value,index);
          }         
        },
        error: (e) => {
          this.showMessage(app,'error');
          setTimeout(() => {
            this.isChangeStatus = false;
          },1000)
        }
      });
    }
  }
  
  updateValue(value: number, index:number): void{ 
    const temp = { ... this.aplications[index] };
    temp.applicationstatus.idu_estatus_aplicacion = value;
    
    this.aplications[index] = {...temp};
    this.isChangeStatus = false;
    this.indexChange = -1;
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
        .pipe(
          catchError(e => throwError(() => ({ error: true })))
        )  
        .subscribe({
            next: (appUp) => {
              if(appUp){
                this.showMessage(appUp,'success');
                this.updateValue(newValue,index);
              }         
            },
            error: () => {
              this.showMessage(app,'error');
              this.updateValue(app.applicationstatus.idu_estatus_aplicacion,index);

              setTimeout(() => {
                this.isChangeStatus = false;
              },1000)
            }
          });
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
  
  showMessage(app: Aplication, severity: string): void{
    let detail = '';
    let summary = '';

    if(severity === 'success'){
      detail = `¡El estado de la aplicación ${app.nom_aplicacion} se a actualizado a ${app.applicationstatus.des_estatus_aplicacion} con éxito!`; 
      summary = 'Estatus actualizado';
    }
    if(severity === 'error'){
      detail = `¡El estado no se pudo actualizar`; 
      summary = 'Error actualizando';
    }
    
    this.messageService.add({ 
      severity, 
      summary, 
      detail 
    });
  }
}
