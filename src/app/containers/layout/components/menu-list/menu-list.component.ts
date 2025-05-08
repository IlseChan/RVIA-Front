import { Component, input } from '@angular/core';
import { MenuItem } from '../../interfaces';
import { MenuItemComponent } from './menu-item/menu-item.component';

@Component({
  selector: 'menu-list',
  standalone: true,
  imports: [MenuItemComponent],
  templateUrl: './menu-list.component.html',
  styleUrl: './menu-list.component.scss'
})
export class MenuListComponent {

  menuName = input<string>('');
  menuItems = input.required<MenuItem[]>(); 
}
