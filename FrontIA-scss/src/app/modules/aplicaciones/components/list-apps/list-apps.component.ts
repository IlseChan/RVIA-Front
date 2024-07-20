import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { TableModule } from 'primeng/table';

import { Aplication } from '@modules/aplicaciones/interfaces/aplicaciones.interfaces';
import { AplicacionesService } from '@modules/aplicaciones/services/aplicaciones.service';
import { UserLogged } from '@modules/auth/interfaces/userLogged.interface';
import { AuthService } from '@modules/auth/services/auth.service';
import { StatusAppPipe } from "../../pipes/status-app.pipe";

@Component({
  selector: 'list-apps',
  standalone: true,
  imports: [ButtonModule, TableModule, CommonModule, PaginatorModule, StatusAppPipe,RouterLink],
  templateUrl: './list-apps.component.html',
  styleUrl: './list-apps.component.scss'
})
export class ListAppsComponent implements OnInit, OnDestroy{
  user!: UserLogged | null;
  aplications: Aplication[] = [];
  
  currentPage: number = 1;
  totalItems: number = 0;

  colums: string[] = ['ID','Nombre','Estatus']


  appsSub!: Subscription;
  listSubs: Subscription[] = [this.appsSub];

  constructor(
    private aplicacionService: AplicacionesService,
    private authService: AuthService ){}
  
  ngOnInit(): void {
    this.user = this.authService.userLogged;
    this.setColumns();
    this.onGetAplicaciones();
  }

  setColumns():void {
    if(this.user && this.user.rol !== 'Invitado'){
      this.colums.push('Acciones');

      if(this.user.rol !== 'Usuario'){
        this.colums.splice(2,0,'Usuario');
      }
    }
  }

  onGetAplicaciones(): void {
    this.appsSub = this.aplicacionService.getAplicaciones(this.currentPage)
    .subscribe(({data,total}) => {
      this.aplications = data;
      this.totalItems  = total;
    });
  }

  onPageChange({ page = 0 }: PaginatorState) {
    const newPage = page + 1;
    if(newPage === this.currentPage) return;
    this.currentPage = newPage;
    this.onGetAplicaciones(); 
  }
  
  ngOnDestroy(): void {
    this.listSubs.forEach(s => s.unsubscribe());
  }
}
