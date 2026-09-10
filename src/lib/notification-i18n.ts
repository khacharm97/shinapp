import type { TFunction } from 'i18next';
import type { Notification as AppNotification } from '@/types';

/**
 * Backend notifications are created with an English `title` / `message` baked in,
 * plus an optional `metadata.i18n` descriptor: `{ titleKey, messageKey, params }`.
 * When present we render the localized strings and fall back to the stored
 * English text for older notifications that predate the descriptor.
 */
interface NotificationI18n {
  titleKey?: string;
  messageKey?: string;
  params?: Record<string, unknown>;
}

export function localizeNotification(
  notification: Pick<AppNotification, 'title' | 'message' | 'metadata'>,
  t: TFunction,
): { title: string; message: string } {
  const i18n = (notification.metadata as { i18n?: NotificationI18n } | undefined)?.i18n;
  const params = i18n?.params ?? {};

  return {
    title: i18n?.titleKey
      ? t(i18n.titleKey, { defaultValue: notification.title, ...params })
      : notification.title,
    message: i18n?.messageKey
      ? t(i18n.messageKey, { defaultValue: notification.message, ...params })
      : notification.message,
  };
}
