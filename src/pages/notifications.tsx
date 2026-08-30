import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} from '@/store/api/authApi';
import type { Notification as AppNotification } from '@/types';
import { SEO } from '@/components/seo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getNotificationLink } from '@/lib/notification-link';
import { toast } from 'react-hot-toast';

export default function NotificationsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading } = useGetNotificationsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsReadMutation();

  const notifications = data?.notifications || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      await markAllRead().unwrap();
    } catch (err) {
      console.error(err);
      toast.error(t('error_marking_all_read', 'Failed to mark all as read'));
    }
  };

  const handleClick = (notification: AppNotification) => {
    if (!notification.isRead) markRead(notification.id);
    const link = getNotificationLink(notification);
    if (link) navigate(link);
  };

  if (isLoading) {
    return (
      <div className="flex-1 w-full bg-slate-50 min-h-[calc(100vh-140px)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="flex-1 w-full bg-slate-50 min-h-[calc(100vh-140px)] py-8 px-4 sm:px-6 lg:px-8">
      <SEO title={t('notifications', 'Notifications')} />

      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {t('notifications', 'Notifications')}
            </h1>
            <p className="text-slate-500 mt-1">
              {unreadCount > 0
                ? t('notifications_unread_count', { count: unreadCount, defaultValue: '{{count}} unread' })
                : t('notifications_all_read', 'You are all caught up.')}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              disabled={isMarkingAll}
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              {t('mark_all_read', 'Mark all read')}
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 py-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">
              {t('no_notifications', 'No notifications')}
            </h3>
            <p className="text-slate-500 mt-1 max-w-sm">
              {t('no_notifications_desc', "You don't have any activity yet.")}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-100 overflow-hidden">
            {notifications.map((notification) => {
              const hasLink = getNotificationLink(notification) !== null;
              return (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => handleClick(notification)}
                  className={cn(
                    'w-full text-left px-5 py-4 flex gap-4 transition-colors',
                    hasLink && 'hover:bg-slate-50',
                    !notification.isRead && 'bg-brand/5'
                  )}
                >
                  <span
                    className={cn(
                      'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                      notification.isRead ? 'bg-transparent' : 'bg-brand'
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-3">
                      <p className="font-semibold text-slate-900">{notification.title}</p>
                      <span className="text-xs text-slate-400 whitespace-nowrap">
                        {format(new Date(notification.createdAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1 leading-snug">
                      {notification.message}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
