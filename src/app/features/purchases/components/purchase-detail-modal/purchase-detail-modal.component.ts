import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Purchase, PurchaseStatus } from '../../models/purchase.model';
import { Role } from '../../../../core/auth/enums/role.enum';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { HasRoleDirective } from '../../../../shared/directives/has-role.directive';
import { DateTimeComponent } from '../../../../shared/components/date-time/date-time.component';
import { NprCurrencyPipe } from '../../../../shared/pipes/currency.pipe';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroXMark, heroShoppingCart, heroTruck, heroUser, heroCalendarDays, heroCheckCircle, heroXCircle, heroClock } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-purchase-detail-modal',
  standalone: true,
  imports: [
    CommonModule,
    HasRoleDirective,
    DateTimeComponent,
    NprCurrencyPipe,
    NgIconComponent
  ],
  viewProviders: [
    provideIcons({
      heroXMark,
      heroShoppingCart,
      heroTruck,
      heroUser,
      heroCalendarDays,
      heroCheckCircle,
      heroXCircle,
      heroClock
    })
  ],
  templateUrl: './purchase-detail-modal.component.html'
})
export class PurchaseDetailModalComponent {
  private authService = inject(AuthService);

  isOpen = input<boolean>(false);
  purchase = input<Purchase | null>(null);

  close = output<void>();
  statusChange = output<{ id: number; status: PurchaseStatus }>();

  readonly Role = Role;
  readonly PurchaseStatus = PurchaseStatus;

  closeModal() {
    this.close.emit();
  }

  changeStatus(status: PurchaseStatus) {
    const p = this.purchase();
    if (p && this.authService.hasRole(Role.ADMIN)) {
      this.statusChange.emit({ id: p.purchaseId, status });
    }
  }
}
