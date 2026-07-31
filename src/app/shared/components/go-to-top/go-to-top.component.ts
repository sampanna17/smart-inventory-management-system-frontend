import { CommonModule } from '@angular/common';
import { Component, HostListener, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChevronUpSolid } from '@ng-icons/heroicons/solid';

@Component({
  selector: 'app-go-to-top',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, NgIcon],
  templateUrl: './go-to-top.component.html',
  styleUrl: './go-to-top.css',
  providers: [
    provideIcons({
      heroChevronUpSolid,
    }),
  ],
})
export class GoToTopComponent {
  readonly isVisible = signal(false);

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isVisible.set(window.scrollY > 150);
  }

  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }
}
