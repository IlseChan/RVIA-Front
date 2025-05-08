import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { PrimeIcons } from 'primeng/api';
import { DividerModule } from 'primeng/divider';

import { AuthService } from '@modules/auth/services/auth.service';
import { Nom_Rol, Usuario } from '@modules/usuarios/interfaces';
import { CoreService } from '@modules/shared/services/core.service';
import { UserBadgeComponent } from "./components/user-badge/user-badge.component";

@Component({
  selector: 'layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive,
    RouterOutlet, DividerModule, UserBadgeComponent],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit, OnDestroy {
  userLogged = signal<Usuario | null>(null);
  menuSidebar = [
    { path: '/apps/home', name: 'Inicio', icon: PrimeIcons.HOME },
  ];
  menuAdmin = [
    { path: '/users/list-users', name: 'Usuarios', icon: PrimeIcons.USERS },
  ];
  menuRvia = [
    { path: '/tools/execute-documentacion', name: 'Documentar proyecto', icon: PrimeIcons.FILE },
    { path: '/tools/test-case', name: 'Casos de prueba', icon: PrimeIcons.CLIPBOARD },
    { path: '/tools/rate-code', name: 'Calificar código', icon: PrimeIcons.CHECK_SQUARE },
  ];
  menuTools = [
    { path: '/tools/recoveryPDF', name: 'Convertir a .csv', icon: PrimeIcons.FILE_EXCEL },
    { path: '/tools/execute-ia', name: 'Ejecutar IA', icon: PrimeIcons.MICROCHIP_AI },
  ];

  Nom_rol = Nom_Rol;
  sidebarActive = false;
  coreVersion: string = '';
  private destroy$ = new Subject<void>();
  
  constructor(
    private router: Router,
    private authService: AuthService,
    private coreService: CoreService 
  ) {}

  ngOnInit(): void {
    this.userLogged.set(this.authService.user());
    this.getCoreVersion();

    if (this.userLogged()?.position.nom_rol !== Nom_Rol.INVITADO) {
      this.menuSidebar.push(
        { path: '/apps/list-apps', name: 'Aplicaciones', icon: PrimeIcons.TABLE },
      );
    }
  }

  getCoreVersion(): void {
    this.coreService.getCoreVersion()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (version: string) => {
          this.coreVersion = version;
        },
        error: (e) => {
          this.coreVersion = '';
        }
      });
  }

  toggleSidebar(): void {
    this.sidebarActive = !this.sidebarActive;
  }

  closeSidebar(): void {
    this.sidebarActive = false;
  }

  logout(): void {
    this.authService.logoutUser();
    this.router.navigate(['/auth/login']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
