import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroBars3,
  heroMagnifyingGlass,
  heroBell,
  heroChevronDown
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  viewProviders: [
    provideIcons({ heroBars3, heroMagnifyingGlass, heroBell, heroChevronDown })
  ],
  templateUrl: './navbar.component.html',
  styleUrls: []
})
export class NavbarComponent {
  toggleSidebar = output<void>();

  onToggle(): void {
    this.toggleSidebar.emit();
  }
}
