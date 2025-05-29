import { Component, inject } from '@angular/core';
import { AuthService } from '@modules/auth/services/auth.service';
import { PrimeNGModule } from '../../../../modules/shared/prime/prime.module';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
    selector: 'user-badge',
    imports: [PrimeNGModule],
    templateUrl: './user-badge.component.html',
    styles: ``
})
export class UserBadgeComponent {

  authSrvc = inject(AuthService);
  router = inject(Router);

  items: MenuItem[] = [
      { separator: true },
      {
        label: 'Ajustes',
        icon: 'pi pi-cog',
        command: this.goSettings.bind(this),
      },
      { separator: true },
      {  
        label: 'Cerrar sesión',
        icon: 'pi pi-sign-out',
        command: this.logout.bind(this),
      }
  ];

  goSettings() {
    this.router.navigate(['/users/settings/my-account']);
  }

  logout() {
    this.authSrvc.logoutUser();
    this.router.navigate(['/auth/login']);
  }
}
