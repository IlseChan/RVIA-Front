import { Routes } from "@angular/router";
import { HomeComponent } from "./components/home/home.component";
import { ListAppsComponent } from "./components/list-apps/list-apps.component";
import { NewAplicationGuard } from "./guards/newAplication.guard";
import { FormSanitizeComponent } from "./components/form-sanitize/form-sanitize.component";

export const appsRoutes: Routes = [
    {
        path: '',
        children: [
            { path: 'home', component: HomeComponent },
            { 
                path: 'list-apps', 
                component: ListAppsComponent,
                canActivate: [NewAplicationGuard] 
            },
            { 
                path: 'new-app', 
                component: FormSanitizeComponent,
                canActivate: [NewAplicationGuard] 
            },
            { path: '**', redirectTo: 'list-apps' },
        ]
    }
];
