import { CommonModule } from '@angular/common';
import { booleanAttribute, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

import { Table } from 'primeng/table';

import { Aplication, ArquitecturaOpciones, NumberAction } from '@modules/aplicaciones-ind/interfaces';
import { PrimeNGModule } from '@modules/shared/prime/prime.module';
import { RviaIconComponent } from "../rvia-icon/rvia-icon.component";

@Component({
  selector: 'table-apps',
  standalone: true,
  imports: [PrimeNGModule, CommonModule, RviaIconComponent],
  templateUrl: './table-apps.component.html',
  styleUrl: './table-apps.component.scss'
})
export class TableAppsComponent implements OnInit {
  
  @ViewChild('dt2') dt2!: Table; 
  @Input({ required: true }) apps: Aplication[] = [];
  @Input({ required: true }) totalItems: number = -1;
  @Input({ required: true }) loadingDataPage: boolean = true;
  @Input({ transform: booleanAttribute }) mainAction: boolean = false;
  @Input({ required: true }) numActionArquit!: NumberAction | ArquitecturaOpciones; 
  @Output() eventRefreshApps = new EventEmitter<void>();

  public colums: string[] = ['#', 'ID proyecto', 'Nombre', 'Proceso','Costos'];
  public rowsPerPageOpts: number[] = [10,15,20,25];
  public lastUpadate: string = '';

  ngOnInit(): void {
    this.lastUpadate = new Date().toString();
  }

  filtercustom(event: Event) {
    const input = event.target as HTMLInputElement;
    this.dt2.filterGlobal(input.value, 'contains');
  }

  refreshApps(): void {
    this.lastUpadate = new Date().toString();
    this.eventRefreshApps.emit();    
  }
}
