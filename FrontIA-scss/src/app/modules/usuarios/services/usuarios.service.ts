import { Injectable } from '@angular/core';
import { Usuario, UsersData } from '../interfaces/usuario.interface';
import { delay, map, Observable, of, tap, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class UsuariosService {  
  private readonly baseUrl = environment.baseURL;

  private allUsers: UsersData = {
    data: [],
    total: -1 
  }
  private changes: boolean = false;

  constructor(private http: HttpClient){}

  getUsuarios(page: number = 1): Observable<UsersData> {
    
    const token = localStorage.getItem('token');
    
    if((token && this.allUsers.data.length === 0 || this.changes)){
      const headerOpc = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        })
      };
      
      return this.http.get<Usuario[]>(`${this.baseUrl}/auth`,headerOpc)
        .pipe(
          tap((r) => {
            this.allUsers.data = r;
            this.allUsers.total = r.length;
            this.changes = false;
          }),
          map(users => {
            return {
              data: this.getUserByPage(page),
              total: users.length 
            }
          })
        )
    }else{
      const data = this.getUserByPage(page);
      return of({
        data,
        total: this.allUsers.total
      })
    }
  }

  private getUserByPage(page: number){
    const from = ( page -1 ) * 5;
    const to = from + 5;
    return this.allUsers.data.slice(from,to);
  }

  getUsuarioById(id: string){
    // const user = this.usuarios.data.filter(user => user.numero_empleado === +id);
    
    // if(user.length > 0){
    //   return of(user[0])
    // }

    // return of(undefined)
  }

  updateUsuario(user: Usuario) {
    
    // return of({
    //   ok: true,
    //   message: 'Se actualizo',
    //   user
    // }).pipe(
    //   delay(2000)
    // )
  }

  deleteUsuario(id: number) {
    
    const token = localStorage.getItem('token');
  
    if(token){
      const headerOpc = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        })
      };

      return this.http.delete(`${this.baseUrl}/auth/${id}`,headerOpc)
        .pipe(
          tap(() => this.changes = true),
          delay(2000)
        )
    }

    return throwError(() => {});
  }

}
