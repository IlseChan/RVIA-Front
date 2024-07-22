import { Routes } from '@angular/router';
import { FormsAppsPageComponent } from './components/form-app/form-app.component';

export const appsRoutes: Routes = [
    {
        path: '',
        children: [
            
            { path: 'new-app', component: FormsAppsPageComponent },

        ]
    }
];
