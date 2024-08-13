import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize, Subscription } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { DialogService, DynamicDialogModule, DynamicDialogRef } from 'primeng/dynamicdialog';

import { Aplication, NumberAction, StatusApps } from '@modules/aplicaciones/interfaces/aplicaciones.interfaces';
import { AplicacionesService } from '@modules/aplicaciones/services/aplicaciones.service';
import { AuthService } from '@modules/auth/services/auth.service';
import { StatusAppPipe } from "../../pipes/status-app.pipe";
import { Nom_Puesto, Usuario } from '@modules/shared/interfaces/usuario.interface';
import { elementPerPage } from '@modules/shared/helpers/dataPerPage';
import { StatusAppLabelPipe } from '@modules/aplicaciones/pipes/status-app-label.pipe';
import { ActionAppPipe } from '@modules/aplicaciones/pipes/action-app.pipe';
import { FormCsvComponent } from '../form-csv/form-csv.component';

@Component({
  selector: 'list-apps',
  standalone: true,
  imports: [ButtonModule, TableModule, CommonModule, 
    PaginatorModule, StatusAppPipe,RouterLink,
    DropdownModule,ConfirmDialogModule,ProgressSpinnerModule,
    TooltipModule,TagModule, StatusAppLabelPipe,ActionAppPipe,
    DynamicDialogModule ],
  templateUrl: './list-apps.component.html',
  styleUrl: './list-apps.component.scss',
  providers: [ConfirmationService, DialogService],
})
export class ListAppsComponent implements OnInit, OnDestroy {
  user!: Usuario | null;
  aplications: Aplication[] = [];
  
  Nom_Puestos = Nom_Puesto;
  StatusApps  = StatusApps;
  NumberAction = NumberAction;

  currentPage:    number = 1;
  totalItems:     number = 0;
  elementPerPage: number = elementPerPage;

  colums: string[] = ['ID','Nombre','Estatus','Proceso'];

  statusOpcs = [
    { name: 'En proceso', code : 1 },
    { name: 'En espera',  code : 2 },
    { name: 'Rechazado',  code : 4 },
  ];

  isLoading: boolean = true;
  isChangeStatus: boolean = false;
  indexChange: number = -1;

  downloadSub!: Subscription;
  isDownload: boolean = false;

  ref: DynamicDialogRef | undefined;

  constructor(
    private aplicacionService: AplicacionesService,
    private authService: AuthService,
    private confirmationService: ConfirmationService,
    private dialogService: DialogService
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
    .pipe(
      finalize(()=> this.isLoading = false),
    )
    .subscribe({
      next: ({data,total}) => {
        if(!data) return
        this.aplications = [...data];
        this.totalItems  = total;
      },
      error: () => {
        this.aplications = [];
        this.totalItems  = 0;
      }}
    );  
  }

  onChangeStatus({value}: DropdownChangeEvent, app: Aplication, index: number): void{
    if(this.isChangeStatus) return;
    
    this.isChangeStatus = true;
    if(value === 4){
      this.dialogConfirmation(app,index,value);
    }else{
      this.aplicacionService.setNewStatus({...app},value)
      .subscribe({ 
        next: (appUp) => {
          if(appUp){
            this.updateValue(value,index);
          }         
        },
        error: () => {
          this.updateValue(app.applicationstatus.idu_estatus_aplicacion,index);
          setTimeout(() => {
            this.isChangeStatus = false;
          },2800)
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

  dialogConfirmation(app: Aplication, index: number, newValue: number): void{
    const message = `¿Deseas rechazar la aplicación ${app.nom_aplicacion}?`;
    this.confirmationService.confirm({
      message,
      header: 'Confirmación de rechazo',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      acceptLabel: 'Sí, rechazar',
      rejectButtonStyleClass: 'p-button-outlined',
      rejectLabel: 'No, cancelar',
      accept: () => {
        this.aplicacionService.setNewStatus({...app},newValue)
        .subscribe({
            next: (appUp) => {
              if(appUp){
                this.updateValue(newValue,index);
              }         
            },
            error: () => {
              this.updateValue(app.applicationstatus.idu_estatus_aplicacion,index);
              setTimeout(() => {
                this.isChangeStatus = false;
              },2800)
            }
          });
      },
      reject: () => {
        this.updateValue(app.applicationstatus.idu_estatus_aplicacion,index);
      }
    });
  }

  onPageChange({ page = 0 }: PaginatorState): void{
    const newPage = page + 1;
    if(newPage === this.currentPage) return;
    this.currentPage = newPage;
    this.onGetAplicaciones(); 
  }
  
  onDownloadFile(app: Aplication): void {
    if(this.isDownload) return;
    this.isDownload = true;
    this.downloadSub = this.aplicacionService.downloadFile(app.idu_aplicacion)  
      .subscribe( {
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = `${app.nom_aplicacion}.zip`;
          document.body.appendChild(anchor);
          anchor.click();
          document.body.removeChild(anchor);
          window.URL.revokeObjectURL(url);
          this.isDownload = false;
        },
        error: () => {
          this.isDownload = false;
        }
      });
  }

  showFormUploadCSV(app: Aplication) {
    this.aplicacionService.appCSVSubject.next(app);
    this.ref = this.dialogService.open(FormCsvComponent, {
        header: 'Upload CSV',
        width: '50vw',
        contentStyle: { overflow: 'auto' },
        breakpoints: {
            '960px': '75vw',
            '640px': '90vw'
        },
        maximizable: false,
    });
  }

  ngOnDestroy(): void {
    if(this.downloadSub) this.downloadSub.unsubscribe();
    if(this.ref) this.ref.close();
  }
}