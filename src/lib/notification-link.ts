import type { Notification as AppNotification } from '@/types';

/**
 * Maps a notification to the in-app route it should open when clicked.
 * Returns `null` when the notification has no meaningful destination
 * (e.g. generic SYSTEM messages) — callers should then just mark it read.
 *
 * New notification types only need a new `case` here.
 */
export function getNotificationLink(notification: AppNotification): string | null {
  const metadata = (notification.metadata || {}) as Record<string, unknown>;
  const orderId = typeof metadata.orderId === 'string' ? metadata.orderId : null;
  const brigadeId = typeof metadata.brigadeId === 'string' ? metadata.brigadeId : null;
  const announcementId =
    typeof metadata.announcementId === 'string' ? metadata.announcementId : null;
  const conversationId =
    typeof metadata.conversationId === 'string' ? metadata.conversationId : null;

  switch (notification.type) {
    case 'ORDER_INVITE':
    case 'ORDER_UPDATE':
    case 'ORDER_ACCEPTED':
    case 'ORDER_REJECTED':
    case 'ORDER_OVERDUE':
      return orderId ? `/profile/orders?orderId=${orderId}` : '/profile/orders';
    case 'BRIGADE_INVITE':
      return brigadeId ? `/brigades/${brigadeId}` : null;
    case 'ANNOUNCEMENT':
      return announcementId ? `/announcements/${announcementId}` : '/announcements';
    case 'MESSAGE':
      return conversationId ? `/messages/${conversationId}` : '/messages';
    default:
      return null;
  }
}
