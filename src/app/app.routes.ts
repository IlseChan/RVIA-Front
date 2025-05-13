import { Routes } from '@angular/router';
import { SessionGuard } from '@modules/auth/guards/session.guard';
import { UserAuthGuard } from '@modules/auth/guards/userAuthGuard.guard';
import { LayoutComponent } from './containers/layout/layout.component';
import { ToolsGuard } from '@modules/herramientas/guards/ToolsGuard.guard';

export const routes: Routes = [
    {
        path: 'auth',
        canActivate: [UserAuthGuard],    
        loadChildren: () => import('@modules/auth/auth.routes').then(m => m.authRoutes)
    },
    {
        path: '',
        component: LayoutComponent,
        canActivate: [SessionGuard],
        children: [
            {
                path: 'apps',
                loadChildren: () => import('@modules/aplicaciones/apps.routes').then(m => m.appsRoutes)
            },
            {
                path: 'users',
                loadChildren: () => import('@modules/usuarios/usuarios.routes').then(m => m.usuariosRoutes)
            },
            {
                path: 'tools',
                canActivate: [ToolsGuard],
                loadChildren: () => import('@modules/herramientas/herramientas.routes').then(m => m.herramientasRoutes)
            },
            {
                path: '',
                redirectTo: 'apps',
                pathMatch: 'full'
            },
        ]
    },
    {
        path: '**',
        redirectTo: ''
    }
];