import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  inject,
  effect
} from '@angular/core';
import { AuthService } from '../../core/auth/services/auth.service';
import { Role } from '../../core/auth/enums/role.enum';

/**
 * Structural directive to conditionally render UI elements based on the current user's role.
 *
 * Usage examples:
 * - Single role enum: `<button *appHasRole="Role.ADMIN">Admin Action</button>`
 * - String role: `<button *appHasRole="'ADMIN'">Admin Action</button>`
 * - Multiple roles: `<div *appHasRole="[Role.ADMIN, Role.STAFF]">Shared View</div>`
 */
@Directive({
  selector: '[appHasRole]',
  standalone: true
})
export class HasRoleDirective {
  private authService = inject(AuthService);
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);

  private hasView = false;
  private requiredRoles: Role | Role[] | string | string[] | null | undefined = null;

  @Input() set appHasRole(roles: Role | Role[] | string | string[] | null | undefined) {
    this.requiredRoles = roles;
    this.updateView();
  }

  constructor() {
    // Automatically react to AuthService user state changes
    effect(() => {
      this.authService.currentUser();
      this.updateView();
    });
  }

  private updateView(): void {
    const isAuthorized = this.authService.hasRole(this.requiredRoles);

    if (isAuthorized && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!isAuthorized && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
