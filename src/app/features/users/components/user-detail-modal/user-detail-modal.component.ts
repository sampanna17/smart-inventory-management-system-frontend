import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserProfile } from '../../models/user-profile.model';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroXMark, heroUser, heroEnvelope, heroShieldCheck, heroSignal, heroCalendarDays } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-user-detail-modal',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  viewProviders: [provideIcons({ heroXMark, heroUser, heroEnvelope, heroShieldCheck, heroSignal, heroCalendarDays })],
  templateUrl: './user-detail-modal.component.html'
})
export class UserDetailModalComponent {
  isOpen = input<boolean>(false);
  user = input<UserProfile | null>(null);

  close = output<void>();

  closeModal() {
    this.close.emit();
  }
}
