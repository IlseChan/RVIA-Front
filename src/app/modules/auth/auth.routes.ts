import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';	

export const authRoutes: Routes = [
    {
        path: '',
        children: [
            { path: 'login', component: LoginComponent, title: 'RVIA - Iniciar sesión' },
            { path: 'register', component: RegisterComponent, title: 'RVIA - Nueva cuenta' },
            { path: '**', redirectTo: 'register' }
        ]
    }
];
