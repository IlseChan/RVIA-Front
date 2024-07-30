import { NgFor, TitleCasePipe } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { UserLogged } from '@modules/auth/interfaces/userLogged.interface';
import { AuthService } from '@modules/auth/services/auth.service';
import { Nom_Puesto } from '@modules/usuarios/interfaces/usuario.interface';
import { UsuariosService } from '@modules/usuarios/services/usuarios.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, NgFor, RouterLink, RouterLinkActive, TitleCasePipe],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  userLogged!: UserLogged | null;
  menuSidebar = [
    { path: '/apps/home', name: 'Inicio'},
    { path: '/apps/list-apps', name: 'Aplicaciones'},
  ];

  sidebarActive = false;

  constructor(
    private router: Router,
    private authService: AuthService){}
  
  ngOnInit(): void {
    this.userLogged = this.authService.userLogged;

    if(this.userLogged && this.userLogged.position.nom_puesto === Nom_Puesto.ADMINISTRADOR){
      this.menuSidebar.push(
        { path: '/apps/users/list-users', name: 'Usuarios'},
      )
    }
  }
  
  toggleSidebar(): void {
    this.sidebarActive = !this.sidebarActive;
  }

  closeSidebar(): void {
    if (this.sidebarActive) {
      this.sidebarActive = false;
    }
  }

  navigateAndCloseSidebar(path: string): void {
    this.closeSidebar();
  }

  logout():void {
    this.authService.onLogout();
    this.router.navigate(['/auth/login']);
  }
}
