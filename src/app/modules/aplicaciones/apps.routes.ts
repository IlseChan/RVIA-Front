import { Routes } from "@angular/router";
import { HomeComponent } from "./components/home/home.component";
import { ListAppsComponent } from "./components/list-apps/list-apps.component";
import { NewAplicationGuard } from "./guards/newAplication.guard";
import { FormSanitizeComponent } from "./components/form-sanitize/form-sanitize.component";

export const appsRoutes: Routes = [
    {
        path: '',
        children: [
            { 
                path: 'home', 
                component: HomeComponent,
                title: 'RVIA - Inicio'
            },
            { 
                path: 'list-apps', 
                component: ListAppsComponent,
                canActivate: [NewAplicationGuard],
                title: 'RVIA - Aplicaciones' 
            },
            { 
                path: 'new-app', 
                component: FormSanitizeComponent,
                canActivate: [NewAplicationGuard],
                title: 'RVIA - Nueva aplicación' 
            },
            { path: '**', redirectTo: 'list-apps' },
        ]
    }
];
