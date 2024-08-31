import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize, Subscription } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { ConfirmationService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { DialogService, DynamicDialogModule, DynamicDialogRef } from 'primeng/dynamicdialog';

import { Aplication, NumberAction, StatusApps } from '@modules/aplicaciones/interfaces/aplicaciones.interfaces';
import { AplicacionesService } from '@modules/aplicaciones/services/aplicaciones.service';
import { AuthService } from '@modules/auth/services/auth.service';
import { StatusAppPipe } from "../../pipes/status-app.pipe";
import { Nom_Rol, Usuario } from '@modules/shared/interfaces/usuario.interface';
import { elementPerPage } from '@modules/shared/helpers/dataPerPage';
import { StatusAppLabelPipe } from '@modules/aplicaciones/pipes/status-app-label.pipe';
import { ActionAppPipe } from '@modules/aplicaciones/pipes/action-app.pipe';
import { FormUpPdfComponent } from '../form-up-pdf/form-up-pdf.component';

@Component({
  selector: 'list-apps',
  standalone: true,
  imports: [ButtonModule, TableModule, CommonModule, 
    PaginatorModule, StatusAppPipe,RouterLink,
    ProgressSpinnerModule,TooltipModule,TagModule, StatusAppLabelPipe,
    ActionAppPipe, DynamicDialogModule ],
  templateUrl: './list-apps.component.html',
  styleUrl: './list-apps.component.scss',
  providers: [ConfirmationService, DialogService],
})
export class ListAppsComponent implements OnInit, OnDestroy {
  user!: Usuario | null;
  aplications: Aplication[] = [];
  
  Nom_Rols = Nom_Rol;
  StatusApps  = StatusApps;
  NumberAction = NumberAction;

  currentPage:    number = 1;
  totalItems:     number = 0;
  elementPerPage: number = elementPerPage;

  colums: string[] = ['#','ID proyecto','Nombre','Estatus','Proceso'];
  isLoading: boolean = true;

  downloadSub!: Subscription;
  isDownload: boolean = false;

  ref: DynamicDialogRef | undefined;

  constructor(
    private aplicacionService: AplicacionesService,
    private authService: AuthService,
    private dialogService: DialogService
  ){}
  
  ngOnInit(): void {
    this.user = this.authService.userLogged;
    this.setColumns();
    this.onGetAplicaciones();
  }

  setColumns():void {
    if(this.user && this.user.position.nom_rol !== Nom_Rol.INVITADO){
      this.colums.push('Acciones','Costos');

      if(this.user.position.nom_rol !== Nom_Rol.USUARIO){
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

  showFormUploadPDF(app: Aplication) {
    if(app.applicationstatus.idu_estatus_aplicacion !== StatusApps.DONE && 
      app.checkmarx.length === 0){
      this.aplicacionService.appPDFSubject.next(app);
      this.ref = this.dialogService.open(FormUpPdfComponent, {
          header: 'Subir archivo .pdf',
          width: '50vw',
          contentStyle: { overflow: 'auto' },
          breakpoints: {
              '960px': '75vw',
              '640px': '90vw'
          },
          maximizable: false,
      });

      this.ref.onClose.subscribe((resp) => {
        if(resp) {
          this.currentPage = 1;
          this.onGetAplicaciones();
        }
      })
    }
  }

  ngOnDestroy(): void {
    if(this.downloadSub) this.downloadSub.unsubscribe();
    if(this.ref) this.ref.close();
  }
}