import { Routes } from "@angular/router";
import { LayoutComponent } from "../../containers/layout/layout.component";
import { HomeComponent } from "./components/home/home.component";
import { ListAppsComponent } from "./components/list-apps/list-apps.component";
import { FormsAppsPageComponent } from "./components/form-app/form-app.component";
import { NewAplicationGuard } from "./guards/newAplication.guard";

export const appsRoutes: Routes = [
    {
        path: '',
        children: [
            { path: 'home', component: HomeComponent },
            { path: 'list-apps', component: ListAppsComponent },
            { 
                path: 'new-app', 
                component: FormsAppsPageComponent,
                canActivate: [NewAplicationGuard] 
            },
            { path: '**', redirectTo: 'list-apps' },
        ]
    }
];
