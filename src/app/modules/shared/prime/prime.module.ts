import { NgModule } from '@angular/core';

import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog'; 
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { PasswordModule } from 'primeng/password';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RadioButtonModule } from 'primeng/radiobutton';
import { StepsModule } from 'primeng/steps';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

@NgModule({
  declarations: [],
  imports: [
    BadgeModule,
    ButtonModule,
    CheckboxModule,
    ConfirmDialogModule,
    DividerModule,
    DropdownModule,
    DynamicDialogModule,
    InputGroupAddonModule,
    InputGroupModule,
    InputTextModule,
    PaginatorModule,
    PasswordModule,
    ProgressSpinnerModule,
    RadioButtonModule,
    StepsModule,
    TableModule,
    TagModule,
    TooltipModule,
  ],
  exports:[
    BadgeModule,
    ButtonModule,
    CheckboxModule,
    ConfirmDialogModule,
    DividerModule,
    DropdownModule,
    DynamicDialogModule,
    InputGroupAddonModule,
    InputGroupModule,
    InputTextModule,
    PaginatorModule,
    PasswordModule,
    ProgressSpinnerModule,
    RadioButtonModule,
    StepsModule,
    TableModule,
    TagModule,
    TooltipModule,
  ]
})
export class PrimeNGModule { }