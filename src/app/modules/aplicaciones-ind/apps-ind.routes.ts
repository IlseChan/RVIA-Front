import { Routes } from "@angular/router";
import { HomeComponent } from "@modules/aplicaciones/components/home/home.component";
import { AplicacionesMiComponent } from "./pages/aplicaciones-mi/aplicaciones-mi.component";
import { NewAplicationGuard } from "@modules/aplicaciones/guards/newAplication.guard";
import { FormSanitizeComponent } from "@modules/aplicaciones/components/form-sanitize/form-sanitize.component";

export const appsIndRoutes: Routes = [
    {
        path: '',
        children: [
            { path: 'home', component: HomeComponent },
            { 
                path: 'list-apps-mi', 
                component: AplicacionesMiComponent,
                canActivate: [NewAplicationGuard] 
            },
            { 
                path: 'new-app', 
                component: FormSanitizeComponent,
                canActivate: [NewAplicationGuard] 
            },
            { path: '**', redirectTo: 'list-apps-mi' },
        ]
    }
];
