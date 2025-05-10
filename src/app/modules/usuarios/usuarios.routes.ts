import { Routes } from "@angular/router";
import { ListUsuariosComponent } from "./components/list-usuarios/list-usuarios.component";
import { EditUsersPageComponent } from "./components/edit-users-page/edit-users-page.component";
import { MyAccountPageComponent } from "./components/my-account-page/my-account-page.component";
import { AdminGuard } from "./guards/adminGuard.guard";

export const usuariosRoutes: Routes = [
    {
        path: '',
        children: [
            { 
                path: 'list-users',
                canActivate: [AdminGuard], 
                component: ListUsuariosComponent,
                title: 'RVIA - Usuarios' 
            },
            { 
                path: 'edit/:id',
                canActivate: [AdminGuard], 
                component: EditUsersPageComponent,
                title: 'RVIA - Editar usuario'
            },
            { 
                path: 'settings/my-account', 
                component: MyAccountPageComponent,
                title: 'RVIA - Mi cuenta'
            },
            { 
                path: '**', 
                redirectTo: 'list-users' 
            },
        ]
    }
];