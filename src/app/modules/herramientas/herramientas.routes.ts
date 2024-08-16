import { Routes } from "@angular/router";
import { PdfToCsvFormComponent } from "./pdf-to-csv-form/pdf-to-csv-form.component";

export const herramientasRoutes: Routes = [
    {
        path: '',
        children: [
            { path: 'recoveryPDF', component: PdfToCsvFormComponent },
            { path: '**', redirectTo: 'recoveryPDF' },
        ]
    }
];