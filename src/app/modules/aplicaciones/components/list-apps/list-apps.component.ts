import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize, Subject, takeUntil } from 'rxjs';

import { Table } from 'primeng/table';

import { PrimeNGModule } from '@modules/shared/prime/prime.module';
import { AplicacionesService } from '@modules/aplicaciones/services/aplicaciones.service';
import { AuthService } from '@modules/auth/services/auth.service';
import { Nom_Rol, Usuario } from '@modules/usuarios/interfaces';
import { downloandFile } from '@modules/shared/helpers/downloadFile';
import { Aplication, ArquitecturaOpciones, NumberAction, StatusApp } from '@modules/aplicaciones/interfaces';
import { RviaIconComponent } from '../rvia-icon/rvia-icon.component';

@Component({
  selector: 'list-apps',
  standalone: true,
  imports: [CommonModule, RouterLink, PrimeNGModule, RviaIconComponent],
  templateUrl: './list-apps.component.html',
  styleUrls: ['./list-apps.component.scss'],
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

  // colums: string[] = ['#', 'ID proyecto', 'Nombre', 'Proceso/Acciones', 'Costos']; //Con costos
  colums: string[] = ['#', 'ID proyecto', 'Nombre', 'Proceso/Acciones'];
  isLoading: boolean = true;

  isDownload: boolean = false;
  lastUpadate: string = '';

  constructor(
    private aplicacionService: AplicacionesService,
    private authService: AuthService,
  ) {}
  
  ngOnInit(): void {
    this.user = this.authService.userLogged;
    this.setColumns();
    this.onGetAplicaciones();
  }

  setColumns(): void {
    if (this.user && (this.user.position.nom_rol === Nom_Rol.ADMINISTRADOR || this.user.position.nom_rol === Nom_Rol.AUTORIZADOR)) {
      this.colums.splice(2, 0, 'Usuario');
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

  onDownloadFile(app: Aplication): void {
    if (this.isDownload || app.applicationstatus.idu_estatus_aplicacion !== StatusApp.DONE) return;
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}