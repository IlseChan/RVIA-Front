import { Routes } from "@angular/router";
import { PdfToCsvFormComponent } from "./components/pdf-to-csv-form/pdf-to-csv-form.component";
import { ExecuteIaComponent } from "./components/execute-ia/execute-ia.component";

export const herramientasRoutes: Routes = [
    {
        path: '',
        children: [
            { path: 'recoveryPDF', component: PdfToCsvFormComponent },
            { path: 'execute-ia', component: ExecuteIaComponent },
            { path: '**', redirectTo: 'recoveryPDF' },
        ]
    }
];