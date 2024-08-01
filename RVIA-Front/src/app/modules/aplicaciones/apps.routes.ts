import { Routes } from "@angular/router";
import { HomeComponent } from "./components/home/home.component";
import { ListAppsComponent } from "./components/list-apps/list-apps.component";
import { NewAplicationGuard } from "./guards/newAplication.guard";
import { ConteinerFormsComponent } from "./components/conteiner-forms/conteiner-forms.component";

export const appsRoutes: Routes = [
    {
        path: '',
        children: [
            { path: 'home', component: HomeComponent },
            { path: 'list-apps', component: ListAppsComponent },
            { 
                path: 'new-app', 
                component: ConteinerFormsComponent,
                canActivate: [NewAplicationGuard] 
            },
            { path: '**', redirectTo: 'list-apps' },
        ]
    }
];
