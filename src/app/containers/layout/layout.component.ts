import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { PrimeIcons } from 'primeng/api';
import { DividerModule } from 'primeng/divider';

import { AuthService } from '@modules/auth/services/auth.service';
import { Nom_Rol, Usuario } from '@modules/shared/interfaces/usuario.interface';
import { GeneratedNumberService } from '@modules/shared/services/generated-number.service'; 
import { TitleCasePipe } from '@angular/common'; 

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive,
    RouterOutlet, DividerModule, TitleCasePipe 
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  userLogged!: Usuario | null;
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
  generatedNumber: string | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private generatedNumberService: GeneratedNumberService 
  ) {}

  ngOnInit(): void {
    this.userLogged = this.authService.userLogged;
    this.getGeneratedNumber();

    if (this.userLogged?.position.nom_rol !== Nom_Rol.INVITADO) {
      this.menuSidebar.push(
        { path: '/apps/list-apps', name: 'Aplicaciones', icon: PrimeIcons.TABLE },
      );
    }
  }

  getGeneratedNumber(): void {
    this.generatedNumberService.getGeneratedNumber()
      .subscribe({
        next: (response: string) => {
          this.generatedNumber = response;
        },
        error: (error: unknown) => {
          console.error('Error al obtener el número:', error);
          this.generatedNumber = null;
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
}
