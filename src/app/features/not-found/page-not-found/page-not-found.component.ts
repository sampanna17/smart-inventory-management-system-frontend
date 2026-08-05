import { ChangeDetectionStrategy, Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';

import { AuthService } from '../../../core/auth/services/auth.service';

@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [RouterLink, NgOptimizedImage],
  templateUrl: './page-not-found.component.html',
  styleUrl: './page-not-found.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageNotFoundComponent {
  private authService = inject(AuthService);
  
  isLoggedIn = computed(() => this.authService.isAuthenticated());
}
