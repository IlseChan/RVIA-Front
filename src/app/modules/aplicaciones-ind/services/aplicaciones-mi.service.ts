import { Injectable } from '@angular/core';
import { catchError, delay, map, Observable, of, tap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../environments/environment';
import { NotificationsService } from '@modules/shared/services/notifications.service';
import { AplicationsData, OriginMethod } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class AplicacionesMiService {
  private readonly baseDom = environment.baseDom;
  private readonly portMi = environment.portMi;
  
  changes: boolean = false;
  allApps: AplicationsData = {
    applications: [],
    total: -1 
  }

  constructor(
    private http: HttpClient,
    private notificationsService: NotificationsService
  ){  }

  getAplicaciones(): Observable<AplicationsData> {
      if(this.allApps.applications.length === 0 || this.changes){
        return this.http.get<AplicationsData>(`${this.baseDom}${this.portMi}/rviami`)
          .pipe(
            tap(apps => {
              this.allApps.applications = apps.applications;
              this.allApps.total = apps.total;
              this.changes = false;
            }),
            map(() => ({...this.allApps })),
            delay(1000),
            catchError(error => this.handleError(error, OriginMethod.GETAPPS))
          )
        }
        else{
          return of({...this.allApps})
        }
  }

   handleError(error: Error, origin: OriginMethod, extra?: string | number) {
      const title = 'Error';
      
      const errorsMessages = {
        GETAPPS: 'Error al cargar aplicaciones migración', 
        GETDOWNLOAD: 'Error al descargar comprimido .7z',
        GETLANGUAGES: 'Ha ocurrido un error al cargar información de lenguajes. Inténtalo de nuevo.',
        POSTSAVEFILE: `Ocurrió un error al guardar el aplicativo. Inténtalo de nuevo`,
      };
  
      this.notificationsService.errorMessage(title,errorsMessages[origin]);
      return throwError(() => 'ERROR ERROR ERROR');
  }
}
