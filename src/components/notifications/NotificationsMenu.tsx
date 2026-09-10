import { useState } from 'react';
import { Bell, Check, CheckCheck, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useAcceptBrigadeInviteMutation,
  useRejectBrigadeInviteMutation,
} from '@/store/api/authApi';
import type { Notification as AppNotification } from '@/types';
import { cn } from '@/lib/utils';
import { getNotificationLink } from '@/lib/notification-link';
import { localizeNotification } from '@/lib/notification-i18n';
import { toast } from 'react-hot-toast';

export function NotificationsMenu({ isMobile = false }: { isMobile?: boolean }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading } = useGetNotificationsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsReadMutation();
  const [acceptInvite, { isLoading: isAccepting }] = useAcceptBrigadeInviteMutation();
  const [rejectInvite, { isLoading: isRejecting }] = useRejectBrigadeInviteMutation();
  const [open, setOpen] = useState(false);

  const notifications = data?.notifications || [];
  const unreadCount = notifications.filter((n: AppNotification) => !n.isRead).length;

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await markRead(id).unwrap();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (unreadCount === 0) return;
    try {
      await markAllRead().unwrap();
    } catch (err) {
      console.error(err);
      toast.error(t('error_marking_all_read', 'Failed to mark all as read'));
    }
  };

  const handleNotificationClick = (notification: AppNotification) => {
    // Unread brigade invites keep their inline Accept / Reject actions — don't
    // consume them with a body click.
    if (notification.type === 'BRIGADE_INVITE' && !notification.isRead) return;

    if (!notification.isRead) handleMarkAsRead(notification.id);
    const link = getNotificationLink(notification);
    if (link) {
      setOpen(false);
      navigate(link);
    }
  };

  const handleAccept = async (notification: AppNotification, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await acceptInvite(notification.metadata?.brigadeId as string).unwrap();
      toast.success(t('invite_accepted', 'Invitation accepted!'));
      await handleMarkAsRead(notification.id);
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      toast.error(e?.data?.message || t('error_accepting_invite', 'Failed to accept invite'));
    }
  };

  const handleReject = async (notification: AppNotification, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await rejectInvite(notification.metadata?.brigadeId as string).unwrap();
      toast.success(t('invite_rejected', 'Invitation rejected.'));
      await handleMarkAsRead(notification.id);
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      toast.error(e?.data?.message || t('error_rejecting_invite', 'Failed to reject invite'));
    }
  };

  const renderNotificationContent = (notification: AppNotification) => {
    const { title, message } = localizeNotification(notification, t);
    return (
      <div
        key={notification.id}
        className={cn(
          "flex flex-col gap-2 p-3 text-sm rounded-md transition-colors cursor-pointer",
          !notification.isRead ? "bg-primary/10 dark:bg-primary/20" : "hover:bg-muted"
        )}
        onClick={() => handleNotificationClick(notification)}
      >
        <div className="flex justify-between items-start gap-2">
          <span className="font-semibold">{title}</span>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {new Date(notification.createdAt).toLocaleDateString()}
          </span>
        </div>
        <p className="text-muted-foreground leading-snug">{message}</p>
        
        {notification.type === 'BRIGADE_INVITE' && !notification.isRead && (
          <div className="flex gap-2 mt-2">
            <Button
              size="sm"
              variant="default"
              className="h-8 flex-1"
              disabled={isAccepting || isRejecting}
              onClick={(e) => handleAccept(notification, e)}
            >
              <Check className="w-4 h-4 mr-1" /> {t('accept', 'Accept')}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 flex-1 border-destructive text-destructive hover:bg-destructive/10"
              disabled={isAccepting || isRejecting}
              onClick={(e) => handleReject(notification, e)}
            >
              <X className="w-4 h-4 mr-1" /> {t('reject', 'Reject')}
            </Button>
          </div>
        )}
      </div>
    );
  };

  if (isMobile) {
    return (
      <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between px-2 mb-2">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Bell className="w-5 h-5" />
            {t('notifications', 'Notifications')}
          </h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-brand"
                disabled={isMarkingAll}
                onClick={handleMarkAllAsRead}
              >
                <CheckCheck className="w-4 h-4 mr-1" />
                {t('mark_all_read', 'Mark all read')}
              </Button>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto px-2">
          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-4">{t('loading', 'Loading...')}</p>
          ) : notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">{t('no_notifications', 'No notifications')}</p>
          ) : (
            notifications.map(renderNotificationContent)
          )}
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground animate-in zoom-in">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-0" align="end" forceMount>
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="font-semibold">{t('notifications', 'Notifications')}</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-brand"
              disabled={isMarkingAll}
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="w-4 h-4 mr-1" />
              {t('mark_all_read', 'Mark all read')}
            </Button>
          )}
        </div>
        <ScrollArea className="h-[350px]">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">{t('loading', 'Loading...')}</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
              <Bell className="h-8 w-8 text-muted-foreground/50 mb-2" />
              {t('no_notifications', 'You have no new notifications.')}
            </div>
          ) : (
            <div className="flex flex-col p-2 gap-1">
              {notifications.map(renderNotificationContent)}
            </div>
          )}
        </ScrollArea>
        <div className="border-t p-2">
          <Button variant="ghost" className="w-full text-xs text-brand h-8" asChild>
            <Link to="/profile/notifications" onClick={() => setOpen(false)}>
              {t('view_all_notifications', 'View all activity')}
            </Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
