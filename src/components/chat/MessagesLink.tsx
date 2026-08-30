import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MessageSquare } from "lucide-react";
import { useGetUnreadCountQuery } from "@/store/api/chatApi";
import { Button } from "@/components/ui/button";

export function MessagesLink({ isMobile = false }: { isMobile?: boolean }) {
  const { t } = useTranslation();
  const { data } = useGetUnreadCountQuery(undefined, { pollingInterval: 60000 });
  const unread = data?.count ?? 0;

  if (isMobile) {
    return (
      <Link
        to="/messages"
        className="flex items-center gap-3 text-foreground/80 hover:text-brand transition-colors"
      >
        <span className="relative">
          <MessageSquare className="w-5 h-5" />
          {unread > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </span>
        {t("messages", "Messages")}
      </Link>
    );
  }

  return (
    <Button asChild variant="ghost" size="icon" className="relative h-10 w-10 rounded-full">
      <Link to="/messages" aria-label={t("messages", "Messages")}>
        <MessageSquare className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </Link>
    </Button>
  );
}
