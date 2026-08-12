import { Component, input, output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { StockMovement, MovementType } from '../../models/stock-movement.model';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroXMark,
  heroArchiveBox,
  heroUser,
  heroCalendarDays,
  heroArrowsRightLeft,
  heroChatBubbleBottomCenterText
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-stock-movement-detail-modal',
  standalone: true,
  imports: [CommonModule, DatePipe, NgIconComponent],
  viewProviders: [
    provideIcons({
      heroXMark,
      heroArchiveBox,
      heroUser,
      heroCalendarDays,
      heroArrowsRightLeft,
      heroChatBubbleBottomCenterText
    })
  ],
  templateUrl: './stock-movement-detail-modal.component.html'
})
export class StockMovementDetailModalComponent {
  isOpen = input<boolean>(false);
  movement = input<StockMovement | null>(null);
  close = output<void>();

  readonly MovementType = MovementType;

  closeModal() {
    this.close.emit();
  }
}
