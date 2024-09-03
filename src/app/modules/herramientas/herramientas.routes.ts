import { Routes } from "@angular/router";
import { PdfToCsvFormComponent } from "./components/pdf-to-csv-form/pdf-to-csv-form.component";
import { ExecuteIaComponent } from "./components/execute-ia/execute-ia.component";
import { ExecuteDocumentacionComponent } from "./components/execute-documentacion/execute-documentacion.component";
import { TestCaseComponent } from "./components/test-case/test-case.component"; 

export const herramientasRoutes: Routes = [
    {
        path: '',
        children: [
            { path: 'recoveryPDF', component: PdfToCsvFormComponent },
            { path: 'execute-ia', component: ExecuteIaComponent },
            { path: 'execute-documentacion', component: ExecuteDocumentacionComponent },
            { path: 'test-case', component: TestCaseComponent }, 
            { path: '**', redirectTo: 'recoveryPDF' },
        ]
    }
];
