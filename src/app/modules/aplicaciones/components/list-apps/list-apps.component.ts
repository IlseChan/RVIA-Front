import { Component, OnDestroy, OnInit, ViewChildren, QueryList, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize, Subject, takeUntil } from 'rxjs';

import { ConfirmationService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Dropdown } from 'primeng/dropdown';
import { Table } from 'primeng/table';

import { PrimeNGModule } from '@modules/shared/prime/prime.module';
import { AplicacionesService } from '@modules/aplicaciones/services/aplicaciones.service';
import { AuthService } from '@modules/auth/services/auth.service';
import { StatusAppPipe } from "../../pipes/status-app.pipe";
import { FormUpPdfComponent } from '../form-up-pdf/form-up-pdf.component';
import { Nom_Rol, Usuario } from '@modules/usuarios/interfaces';
import { downloandFile } from '@modules/shared/helpers/downloadFile';
import { Aplication, ArquitecturaOpciones, NumberAction, StatusApp } from '@modules/aplicaciones/interfaces';

@Component({
  selector: 'list-apps',
  standalone: true,
  imports: [CommonModule, StatusAppPipe, RouterLink, PrimeNGModule],
  templateUrl: './list-apps.component.html',
  styleUrls: ['./list-apps.component.scss'],
  providers: [ConfirmationService, DialogService],
})
export class ListAppsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  @ViewChild('dt2') dt2!: Table; 
  user!: Usuario | null;
  aplications: Aplication[] = [];
  
  Nom_Rols = Nom_Rol;
  StatusApps = StatusApp; 
  NumberAction = NumberAction;
  ArquitecturaOpciones = ArquitecturaOpciones;

  totalItems: number = 0;
  loadingDataPage: boolean = true;
  rowsPerPageOpts: number[] = [10,15,20,25];

  colums: string[] = ['#', 'ID proyecto', 'Nombre', 'Proceso'];
  isLoading: boolean = true;

  isDownload: boolean = false;
  ref: DynamicDialogRef | undefined;
  lastUpadate: string = '';

  @ViewChildren('dropdown') dropdowns!: QueryList<Dropdown>;

  constructor(
    private aplicacionService: AplicacionesService,
    private authService: AuthService,
    private dialogService: DialogService
  ) {}
  
  ngOnInit(): void {
    this.user = this.authService.userLogged;
    this.setColumns();
    this.onGetAplicaciones();
  }

  setColumns(): void {
    if (this.user && this.user.position.nom_rol !== Nom_Rol.INVITADO) {
      this.colums.push('Costos');

      if (this.user.position.nom_rol !== Nom_Rol.USUARIO) {
        this.colums.splice(2, 0, 'Usuario');
      }
    }
  }

  filtercustom(event: Event) {
    const input = event.target as HTMLInputElement;
    this.dt2.filterGlobal(input.value, 'contains');
  }

  onGetAplicaciones(): void {
    this.isLoading = true;
    this.lastUpadate = new Date().toString();
    this.aplicacionService.getAplicaciones()
      .pipe(
        finalize(() => this.isLoading = false),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: ({ data, total }) => {
          if (!data) return;
          this.loadingDataPage = true;
          this.totalItems = total;
          this.aplications = [...data];
          this.loadingDataPage = false;

        },
        error: () => {
          this.aplications = [];
          this.totalItems = 0;
        }
      });  
  }

  refreshApps(): void {
    this.aplicacionService.changes = true;
    this.onGetAplicaciones();
  }
  
  getDropdownPlaceholder(app: Aplication): string {
    return app.num_accion === NumberAction.NONE ? 'Sin modificar el código' :
           app.num_accion === NumberAction.UPDATECODE ? 'Actualización' :
           app.num_accion === NumberAction.MIGRATION ? 'Migración' :
           app.num_accion === NumberAction.SANITIZECODE ? 'Sanitización' : '';
  }

  onDownloadFile(app: Aplication): void {
    if (this.isDownload) return;
    this.isDownload = true;
    this.aplicacionService.downloadFile(app.idu_aplicacion)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          const fileName = `${app.idu_proyecto}_${app.nom_aplicacion}.7z`;
          downloandFile(blob, fileName);
          this.isDownload = false;
        },
        error: () => {
          this.isDownload = false;
        }
      });
  }

  showFormUploadPDF(app: Aplication) {
    if (app.applicationstatus.idu_estatus_aplicacion !== this.StatusApps.DONE && 
      app.checkmarx.length === 0) {
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
        if (resp) {
          this.onGetAplicaciones();
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.ref) this.ref.close();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
