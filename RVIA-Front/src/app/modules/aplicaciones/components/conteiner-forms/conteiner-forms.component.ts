import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { RadioButtonModule } from 'primeng/radiobutton';
import { FormSanitizeComponent } from "../form-sanitize/form-sanitize.component";
import { FormUpdateComponent } from "../form-update/form-update.component";

@Component({
  selector: 'conteiner-forms',
  standalone: true,
  imports: [CommonModule, ButtonModule, RadioButtonModule, FormsModule, FormSanitizeComponent, FormUpdateComponent],
  templateUrl: './conteiner-forms.component.html',
  styleUrl: './conteiner-forms.component.scss'
})
export class ConteinerFormsComponent {

  radioOps = [
    { value: 'op1', txt: 'Actualizar código' },
    { value: 'op2', txt: 'Sanitizar código' },
  ];
  option: 'op1' | 'op2' = 'op1';

  constructor(
    private router: Router,
  ){}

  back(): void{
    this.router.navigate(['apps/list-apps'],{ replaceUrl: true });
  }
}
