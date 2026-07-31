import { CommonModule } from '@angular/common';
import { Component, HostListener, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-go-to-top',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './go-to-top.component.html',
  styleUrl: './go-to-top.css',
})
export class GoToTopComponent {
  readonly isVisible = signal(false);

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isVisible.set(window.scrollY > 300);
  }

  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }
}
