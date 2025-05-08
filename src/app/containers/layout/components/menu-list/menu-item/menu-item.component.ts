import { Component, input } from '@angular/core';
import { MenuItem } from '../../../interfaces';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  selector: 'menu-item',
  standalone: true,
  imports: [RouterLink, RouterLinkActive,NgClass],
  templateUrl: './menu-item.component.html',
  styleUrl: './menu-item.component.scss'
})
export class MenuItemComponent {

  item = input.required<MenuItem>();
}
