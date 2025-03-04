import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PrimeNGModule } from '@modules/shared/prime/prime.module';

@Component({
  selector: 'title-table',
  standalone: true,
  imports: [RouterLink, PrimeNGModule],
  templateUrl: './title-table.component.html',
  styleUrl: './title-table.component.scss'
})
export class TitleTableComponent {

}
