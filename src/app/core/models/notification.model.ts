export type NotificationType =
  | 'LOW_STOCK'
  | 'OUT_OF_STOCK'
  | 'STAFF_ACCOUNT_CREATED'
  | 'ORDER_PLACED'
  | 'REPORT'
  | 'GENERAL';

export interface NotificationItem {
  notificationID: number;
  userID: number;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}
