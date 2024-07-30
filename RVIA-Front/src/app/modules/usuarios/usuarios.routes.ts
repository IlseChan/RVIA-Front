import { Routes } from "@angular/router";
import { ListUsuariosComponent } from "./components/list-usuarios/list-usuarios.component";
import { EditUsersPageComponent } from "./components/edit-users-page/edit-users-page.component";
import { LayoutComponent } from "src/app/containers/layout/layout.component";

export const usuariosRoutes: Routes = [
    {
        path: '',
        children: [
            { path: 'list-users', component: ListUsuariosComponent },
            { path: 'edit/:id', component: EditUsersPageComponent },
            { path: '**', redirectTo: 'list-users' },
        ]
    }
];