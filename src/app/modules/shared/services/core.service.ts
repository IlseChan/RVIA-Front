import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, map, throwError } from 'rxjs';
import { NotificationsService } from './notifications.service';
import { CoreVersion } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class CoreService {
  private readonly baseUrl = environment.baseURL;

  private http = inject(HttpClient);
  private notificacionsSrvc = inject(NotificationsService);
  
  versions = signal<string[]>([]);
  tagsVersion: Record<string, string>  = {
    versionAct: "ACT",
    versionCap: "CAP",
    versionDim: "DIM",
    versionDoc: "DOC",
    versionDof: "DOF",
    versionSan: "SAN",
  };

  getCoreVersion(){
    this.http.get<CoreVersion>(`${this.baseUrl}/rvia`).pipe(
      map((versions: CoreVersion) => {
        const versionArra = Object.entries(versions)
          .map(([k,v]) => `${this.tagsVersion[k]} V-${v}`);
        
        const result: string[][] = [];
    
        for (let i = 0; i < versionArra.length; i += 4) {
          result.push(versionArra.slice(i, i + 4));
        }

        return result.map((g) => g.join(' | '));
      }),
      catchError((error) => {
        this.handleError(error, 'No se puede obtener el número de versión del core.');
        return throwError(() => 'ERROR ERROR ERROR');
      })
    ).subscribe(resp => {
      this.versions.set(resp);
    });
  }

  handleError(error: Error,message: string) {
    const title = 'Error';
    
    this.notificacionsSrvc.errorMessage(title,message);
    return throwError(() => 'ERROR ERROR [CORESERVICE]');
  }
}
