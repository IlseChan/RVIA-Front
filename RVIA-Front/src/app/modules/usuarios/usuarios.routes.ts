import { Routes } from "@angular/router";
import { ListUsuariosComponent } from "./components/list-usuarios/list-usuarios.component";
import { EditUsersPageComponent } from "./components/edit-users-page/edit-users-page.component";

export const usuariosRoutes: Routes = [
    { path: 'list-users', component: ListUsuariosComponent },
    { path: 'edit/:id', component: EditUsersPageComponent },
];