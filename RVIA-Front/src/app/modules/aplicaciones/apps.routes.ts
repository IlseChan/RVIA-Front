import { Routes } from "@angular/router";
import { LayoutComponent } from "../../containers/layout/layout.component";
import { HomeComponent } from "./components/home/home.component";
import { ListAppsComponent } from "./components/list-apps/list-apps.component";
import { FormsAppsPageComponent } from "./components/form-app/form-app.component";
import { usuariosRoutes } from "@modules/usuarios/usuarios.routes";
import { AplicacionesGuard } from "./guards/aplicaciones.guard";
import { AdminGuard } from "@modules/usuarios/guards/adminGuard.guard";

export const appsRoutes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            { path: 'home', component: HomeComponent },
            { path: 'list-apps', component: ListAppsComponent },
            { 
                path: 'new-app', 
                component: FormsAppsPageComponent,
                canActivate: [AplicacionesGuard] 
            },
            {
                path: 'users',
                canActivate: [AdminGuard],
                children: usuariosRoutes
            },
            { path: '**', redirectTo: 'list-apps' },
        ]
    }
];