import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Aplication, GetAplicacionesResponse } from '../interfaces/aplicaciones.interfaces';

@Injectable({
  providedIn: 'root'
})
export class AplicacionesService {
  // private data: GetAplicacionesResponse = {
  //   data: [
  //     {
  //       id:   1,
  //       name: 'Intranet-botonera',
  //       user: 'Luis',
  //       status: 2
  //     },
  //     {
  //       id:   2,
  //       name: 'Web App simple',
  //       status: 1,
  //       user: 'Angel',
  //       linkDownload:  'assets/images/portada.jpeg'
  //     },
  //     {
  //       id:   3,
  //       name: 'SI.exe',
  //       status: 3,
  //       user: 'Ilse',
  //       linkDownload:  'assets/images/portada.jpeg'
  //     },
  //     {
  //       id:   4,
  //       name: 'Intranet-huellas',
  //       user: 'Brandon',
  //       status: 4
  //     },
  //     {
  //       id:   5,
  //       name: 'Aplicacion prueba 2',
  //       user: 'Luis',
  //       status: 1
  //     },
  //     {
  //       id:   6,
  //       name: '6Intranet-botonera',
  //       user: 'Luis',
  //       status: 2
  //     },
  //     {
  //       id:   7,
  //       name: '7Web App simple',
  //       user: 'Angel',
  //       status: 1,
  //       linkDownload:  'assets/images/portada.jpeg'
  //     },
  //     {
  //       id:   8,
  //       name: '8SI.exe',
  //       status: 2,
  //       user: 'Otro',
  //       linkDownload:  'assets/images/portada.jpeg'
  //     },
  //     {
  //       id:   9,
  //       name: '9Intranet-huellas',
  //       user: 'Otro',
  //       status: 3
  //     },
  //     {
  //       id:   10,
  //       name: '10Aplicacion prueba 2',
  //       user: 'Luis',
  //       status: 2
  //     },
  //     {
  //       id:   11,
  //       name: '11SI.exe',
  //       user: 'Ilse',
  //       status: 1,
  //       linkDownload:  'assets/images/portada.jpeg'
  //     },
  //     {
  //       id:   12,
  //       name: '12Intranet-huellas',
  //       user: 'Brandon',
  //       status: 3
  //     },
  //     {
  //       id:   13,
  //       name: '13Aplicacion prueba 2',
  //       user: 'Brandon',
  //       status: 4
  //     },
  //   ],
  //   total: 13
  // } as GetAplicacionesResponse

  constructor() { }

  getAplicaciones(page: number = 1) {
    // const from = ( page -1 ) * 5;
    // const to = from + 5;
    // const tmpData = this.data.data.slice(from,to);
    
    return of({
      // data: tmpData,
      // total: this.data.total
    })
  }

  setNewStatus(app: Aplication, newStatus: number) {
    // app.status = newStatus;

    return of({
      ok: true,
      message: 'Se hizo',
      // app
    });
  }
}
