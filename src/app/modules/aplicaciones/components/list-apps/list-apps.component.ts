import { Component, OnDestroy, OnInit, ViewChildren, QueryList, AfterViewChecked, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize, Subject, takeUntil } from 'rxjs';

import { ConfirmationService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Dropdown } from 'primeng/dropdown';
import { PaginatorState } from 'primeng/paginator';

import { PrimeNGModule } from '@modules/shared/prime/prime.module';
import { Aplication, NumberAction, StatusApps, ArquitecturaOpciones, Opt_architec } from '@modules/aplicaciones/interfaces/aplicaciones.interfaces';
import { AplicacionesService } from '@modules/aplicaciones/services/aplicaciones.service';
import { AuthService } from '@modules/auth/services/auth.service';
import { StatusAppPipe } from "../../pipes/status-app.pipe";
import { elementPerPage } from '@modules/shared/helpers/dataPerPage';
import { StatusAppLabelPipe } from '@modules/aplicaciones/pipes/status-app-label.pipe';
import { ActionAppPipe } from '@modules/aplicaciones/pipes/action-app.pipe';
import { FormUpPdfComponent } from '../form-up-pdf/form-up-pdf.component';
import { Nom_Rol, Usuario } from '@modules/usuarios/interfaces';
import { downloandFile } from '@modules/shared/helpers/downloadFile';

@Component({
  selector: 'list-apps',
  standalone: true,
  imports: [CommonModule, StatusAppPipe, RouterLink,StatusAppLabelPipe,
    ActionAppPipe, PrimeNGModule],
  templateUrl: './list-apps.component.html',
  styleUrls: ['./list-apps.component.scss'],
  providers: [ConfirmationService, DialogService],
})
export class ListAppsComponent implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked {
  private destroy$ = new Subject<void>();
  user!: Usuario | null;
  aplications: Aplication[] = [];
  
  Nom_Rols = Nom_Rol;
  StatusApps  = StatusApps;
  NumberAction = NumberAction;
  ArquitecturaOpciones = ArquitecturaOpciones;

  currentPage:    number = 1;
  totalItems:     number = 0;
  elementPerPage: number = elementPerPage;

  colums: string[] = ['#','ID proyecto','Nombre','Proceso'];
  isLoading: boolean = true;

  isDownload: boolean = false;
  ref: DynamicDialogRef | undefined;

  @ViewChildren('dropdown') dropdowns!: QueryList<Dropdown>;
  private dropdownMap = new Map<string, Dropdown>(); 

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

  ngAfterViewInit(): void {
    this.updateDropdownMap();
  }

  ngAfterViewChecked(): void {
    this.updateDropdownMap(); 
  }


  private updateDropdownMap(): void {
    this.dropdowns.forEach((dropdown, index) => {
      const id = dropdown.el.nativeElement.getAttribute('data-id'); 
      if (id) {
        this.dropdownMap.set(id, dropdown); 
      }
    });
  }

  setColumns(): void {
    if (this.user && this.user.position.nom_rol !== Nom_Rol.INVITADO) {
      this.colums.push('Acciones', 'Costos');

      if (this.user.position.nom_rol !== Nom_Rol.USUARIO) {
        this.colums.splice(2, 0, 'Usuario');
      }
    }
  }

  onGetAplicaciones(): void {
    this.isLoading = true;
    this.aplicacionService.getAplicaciones(this.currentPage)
      .pipe(
        finalize(() => this.isLoading = false),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: ({ data, total }) => {
          if (!data) return;
          this.aplications = [...data];
          this.totalItems = total;    
        },
        error: () => {
          this.aplications = [];
          this.totalItems = 0;
        }
      });  
  }

  getArquitecturaOptions(opc_arquitectura: Opt_architec) {
    const options = [];
  
    if (opc_arquitectura[ArquitecturaOpciones.DOCUMENTATION_OVERVIEW]) {
      options.push({ label: 'Documentación Overview', value: 'Documentación completa', styleClass: 'tag-info', disabled: true });
    }
  
    if (opc_arquitectura[ArquitecturaOpciones.DOCUMENTATION_CODE]) {
      options.push({ label: 'Documentación Código', value: 'Documentación por código', styleClass: 'tag-primary', disabled: true });
    }
  
    if (opc_arquitectura[ArquitecturaOpciones.TEST_CASES]) {
      options.push({ label: 'Casos de prueba', value: 'Casos de prueba', styleClass: 'tag-warning', disabled: true });
    }
  
    if (opc_arquitectura[ArquitecturaOpciones.EVALUATION]) {
      options.push({ label: 'Calificación', value: 'Calificación', styleClass: 'tag-success', disabled: true });
    }
  
    if (options.length === 0) {
      options.push({ label: 'Sin arquitectura', value: 'Sin arquitectura', styleClass: 'tag-secondary', disabled: true });
    }
  
    return options;
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
          const fileName = `${app.nom_aplicacion}.zip`;
          downloandFile(blob,fileName);
          this.isDownload = false;
        },
        error: () => {
          this.isDownload = false;
        }
      });
  }

  showFormUploadPDF(app: Aplication) {
    if (app.applicationstatus.idu_estatus_aplicacion !== StatusApps.DONE && 
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
          this.currentPage = 1;
          this.onGetAplicaciones();
        }
      })
    }
  }

  onPageChange({ page = 0 }: PaginatorState): void {
    const newPage = page + 1;
    if (newPage === this.currentPage) return;
    this.currentPage = newPage;
    this.onGetAplicaciones(); 
  }

 
  onDropdownHover(sequentialId: string, index: number): void {
    const dropdown = this.dropdownMap.get(`${sequentialId}-${index}`);
    if (dropdown) {
      dropdown.show(); 
    }
  }

  onDropdownLeave(sequentialId: string, index: number): void {
    const dropdown = this.dropdownMap.get(`${sequentialId}-${index}`);
    if (dropdown) {
      dropdown.hide(); 
    }
  }

  ngOnDestroy(): void {
    if (this.ref) this.ref.close();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
