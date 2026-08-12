import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserProfile } from '../../models/user-profile.model';
import { Role } from '../../../../core/auth/enums/role.enum';
import { Status } from '../../../../core/enums/status.enum';
import { DateTimeComponent } from '../../../../shared/components/date-time/date-time.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroXMark, heroUser, heroEnvelope, heroShieldCheck, heroSignal, heroCalendarDays } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-user-detail-modal',
  standalone: true,
  imports: [CommonModule, DateTimeComponent, NgIconComponent],
  viewProviders: [provideIcons({ heroXMark, heroUser, heroEnvelope, heroShieldCheck, heroSignal, heroCalendarDays })],
  templateUrl: './user-detail-modal.component.html'
})
export class UserDetailModalComponent {
  isOpen = input<boolean>(false);
  user = input<UserProfile | null>(null);

  close = output<void>();

  readonly Role = Role;
  readonly Status = Status;

  closeModal() {
    this.close.emit();
  }
}
