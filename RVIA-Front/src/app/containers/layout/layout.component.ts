import { NgFor, TitleCasePipe } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '@modules/auth/services/auth.service';
import { Nom_Puesto, Usuario } from '@modules/shared/interfaces/usuario.interface';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, NgFor, RouterLink, RouterLinkActive, TitleCasePipe],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  userLogged!: Usuario | null;
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
        { path: '/users/list-users', name: 'Usuarios'},
      )
    }
  }
  
  toggleSidebar(): void {
    this.sidebarActive = !this.sidebarActive;
  }

  closeSidebar(): void {
    if (this.sidebarActive) this.sidebarActive = false;
  }

  logout():void {
    this.authService.onLogout();
    this.router.navigate(['/auth/login']);
  }
}
