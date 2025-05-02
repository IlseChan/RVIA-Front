import { Routes } from "@angular/router";
import { ListUsuariosComponent } from "./components/list-usuarios/list-usuarios.component";
import { EditUsersPageComponent } from "./components/edit-users-page/edit-users-page.component";

export const usuariosRoutes: Routes = [
    {
        path: '',
        children: [
            { 
                path: 'list-users', 
                component: ListUsuariosComponent,
                title: 'RVIA - Usuarios' 
            },
            { 
                path: 'edit/:id', 
                component: EditUsersPageComponent,
                title: 'RVIA - Editar usuario'
            },
            { 
                path: '**', 
                redirectTo: 'list-users' 
            },
        ]
    }
];