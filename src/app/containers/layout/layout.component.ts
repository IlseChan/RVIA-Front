import { NgClass, NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { PrimeIcons } from 'primeng/api';
import { DividerModule } from 'primeng/divider';

import { AuthService } from '@modules/auth/services/auth.service';
import { Nom_Rol, Usuario } from '@modules/shared/interfaces/usuario.interface';

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
  generatedNumber: string | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private http: HttpClient){}
  
  ngOnInit(): void {
    this.userLogged = this.authService.userLogged;
    this.getGeneratedNumber();
    if(this.userLogged?.position.nom_rol !== Nom_Rol.INVITADO){
      this.menuSidebar.push(
        { path: '/apps/list-apps', name: 'Aplicaciones', icon: PrimeIcons.TABLE },
      );
    }
  }

  getGeneratedNumber(): void {
    this.http.get('http://localhost:3001/rvia', { responseType: 'text' })
      .subscribe({
        next: (response: string) => {
          this.generatedNumber = response;
        },
        error: (error) => {
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
