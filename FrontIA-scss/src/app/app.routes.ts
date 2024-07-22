import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'apps',
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
