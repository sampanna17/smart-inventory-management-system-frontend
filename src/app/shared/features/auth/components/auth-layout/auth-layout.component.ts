import { Component, Input } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './auth-layout.component.html',
  styleUrls: []
})
export class AuthLayoutComponent {
  @Input() illustrationSrc: string = '/assets/images/login-illustration.png';
  @Input() illustrationTitle: string = 'Welcome';
  @Input() illustrationDesc: string = 'Manage your system efficiently and securely.';
}
