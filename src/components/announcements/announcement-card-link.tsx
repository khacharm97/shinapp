import type { CSSProperties, ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Lock } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { useRequireLogin } from "@/components/auth/login-required-context";
import { cn } from "@/lib/utils";

function useIsLoggedIn() {
  return useAppSelector((s) => !!s.auth.token);
}

interface AnnouncementCardLinkProps {
  id: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

// Announcement details are for logged-in users only.
// Logged out, clicking the card asks them to log in, then brings them to the announcement.
export function AnnouncementCardLink({ id, className, style, children }: AnnouncementCardLinkProps) {
  const { t } = useTranslation();
  const isLoggedIn = useIsLoggedIn();
  const requireLogin = useRequireLogin();

  if (isLoggedIn) {
    return (
      <Link to={`/announcements/${id}`} className={className} style={style}>
        {children}
      </Link>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => requireLogin(`/announcements/${id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          requireLogin(`/announcements/${id}`);
        }
      }}
      className={cn(className, "cursor-pointer")}
      style={style}
      title={t("announcement_login_to_view", "Log in to see the details")}
    >
      {children}
    </div>
  );
}

// Wraps the "View details" label: blurred with a lock when logged out.
export function AnnouncementDetailsHint({ children }: { children: ReactNode }) {
  const isLoggedIn = useIsLoggedIn();

  if (isLoggedIn) return <>{children}</>;

  return (
    <span className="relative inline-flex items-center justify-center shrink-0">
      <span aria-hidden className="blur-[3px] select-none pointer-events-none">
        {children}
      </span>
      <Lock className="absolute w-4 h-4 text-brand" />
    </span>
  );
}
