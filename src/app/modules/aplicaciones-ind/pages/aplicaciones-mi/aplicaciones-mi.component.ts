import { CommonModule } from '@angular/common';
import { Component, signal, inject, OnInit } from '@angular/core';
import { finalize, Subject, takeUntil } from 'rxjs';

import { TitleTableComponent } from '@modules/aplicaciones-ind/components/title-table/title-table.component';
import { Aplication } from '@modules/aplicaciones-ind/interfaces';
import { AplicacionesMiService } from '@modules/aplicaciones-ind/services/aplicaciones-mi.service';
import { PrimeNGModule } from '@modules/shared/prime/prime.module';
import { TableAppsComponent } from "../../components/table-apps/table-apps.component";

@Component({
  selector: 'aplicaciones-mi',
  standalone: true,
  imports: [TitleTableComponent, PrimeNGModule, CommonModule, TableAppsComponent],
  templateUrl: './aplicaciones-mi.component.html',
  styleUrl: './aplicaciones-mi.component.scss'
})
export class AplicacionesMiComponent implements OnInit {
  private destroy$ = new Subject<void>();
  private aplicacionesMiSrvc = inject(AplicacionesMiService);  
  
  public isLoading = signal(true);
  public aplications: Aplication[] = [];
  public totalItems: number = 0;
  public loadingDataPage: boolean = true;

  ngOnInit(): void {
    this.onGetAplicaciones();
  }

  onGetAplicaciones(): void {
    this.isLoading.set(true);
    this.aplicacionesMiSrvc.getAplicaciones()
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: ({ applications, total }) => {
          if (!applications) return;

          this.loadingDataPage = true;
          this.totalItems = total;
          this.aplications = [...applications];
          this.loadingDataPage = false;

        },
        error: () => {
          this.aplications = [];
          this.totalItems = 0;
        }
      });  
  }

  refreshApps() {
    this.aplicacionesMiSrvc.changes = true;
    this.onGetAplicaciones();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
