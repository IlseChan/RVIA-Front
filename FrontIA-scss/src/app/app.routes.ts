
import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'auth',
        loadChildren: () => import('@modules/auth/auth.routes').then(m => m.authRoutes)
    },
    {
        path: 'apps',
        loadChildren: () => import('@modules/aplicaciones/apps.routes').then(m => m.appsRoutes)
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
