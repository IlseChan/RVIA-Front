import { Routes } from '@angular/router';
import { SessionGuard } from '@modules/auth/guards/session.guard';
import { UserAuthGuard } from '@modules/auth/guards/userAuthGuard.guard';

export const routes: Routes = [
    {
        path: 'auth',
        canActivate: [UserAuthGuard],
        loadChildren: () => import('./modules/auth/auth.routes').then(m => m.authRoutes)
    },
    {
        path: 'apps',
        canActivate: [SessionGuard],
        loadChildren: () => import('./modules/aplicaciones/apps.routes').then(m => m.appsRoutes)
    },
    {
        path: '',
        redirectTo: 'apps',
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: 'apps'
    }
];