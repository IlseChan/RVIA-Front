import { NgClass, NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { DividerModule } from 'primeng/divider';

import { AuthService } from '@modules/auth/services/auth.service';
import { Nom_Rol, Usuario } from '@modules/shared/interfaces/usuario.interface';
import { PrimeIcons } from 'primeng/api';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, NgFor, RouterLink, 
    RouterLinkActive, TitleCasePipe,NgClass, 
    DividerModule, NgIf],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  userLogged!: Usuario | null;
  menuSidebar = [
    { path: '/apps/home', name: 'Inicio', icon: PrimeIcons.HOME},
  ];
  menuAdmin = [
    { path: '/users/list-users', name: 'Usuarios', icon: PrimeIcons.USERS },
  ];
  menuTools = [
    { path: '/tools/recoveryPDF', name: 'Convertir a .csv', icon: PrimeIcons.FILE_EXCEL },
    { path: '/tools/execute-ia', name: 'Ejecutar IA', icon:PrimeIcons.MICROCHIP_AI }
  ]

  Nom_rol = Nom_Rol;
  sidebarActive = false;

  constructor(
    private router: Router,
    private authService: AuthService){}
  
  ngOnInit(): void {
    this.userLogged = this.authService.userLogged;
    if(this.userLogged?.position.nom_rol !== Nom_Rol.INVITADO){
      this.menuSidebar.push(
        { path: '/apps/list-apps', name: 'Aplicaciones', icon: PrimeIcons.TABLE },
      );
    }
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
