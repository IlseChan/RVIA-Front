import { Routes } from "@angular/router";

import { PdfToCsvFormComponent } from "./components/pdf-to-csv-form/pdf-to-csv-form.component";
import { ExecuteIaComponent } from "./components/execute-ia/execute-ia.component";
import { ExecuteDocumentacionComponent } from "./components/execute-documentacion/execute-documentacion.component";
import { TestCaseComponent } from "./components/test-case/test-case.component"; 
import { RateCodeComponent } from "./components/rate-code/rate-code.component";
import { AdminGuard } from "@modules/usuarios/guards/adminGuard.guard";

export const herramientasRoutes: Routes = [
    {
        path: '',
        children: [
            { 
                path: 'recoveryPDF', 
                canActivate: [AdminGuard], 
                component: PdfToCsvFormComponent,
                title: 'RVIA - RecoveryPDF' 
            },
            { 
                path: 'execute-ia',
                canActivate: [AdminGuard], 
                component: ExecuteIaComponent,
                title: 'RVIA - Ejecutar IA' 
            },
            { 
                path: 'execute-documentacion', 
                component: ExecuteDocumentacionComponent,
                title: 'RVIA - Documentación' 
            },
            { 
                path: 'test-case',
                component: TestCaseComponent,
                title: 'RVIA - Casos de pruebas' 
            }, 
            { 
                path: 'rate-code',
                component: RateCodeComponent,
                title: 'RVIA - Califcar código' 
            }, 
            { 
                path: '**', 
                redirectTo: 'execute-documentacion' 
            },
        ]
    }
];
