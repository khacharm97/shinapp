import { useCallback, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { rememberReturnTo } from "@/lib/return-to";
import { LoginRequiredContext } from "./login-required-context";

// Provides useRequireLogin() to the whole app and renders its dialog.
export function LoginRequiredProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  // The page to return to while the dialog is open; null when closed.
  const [returnTo, setReturnTo] = useState<string | null>(null);

  const requireLogin = useCallback(
    (path?: string) => setReturnTo(path ?? location.pathname + location.search),
    [location.pathname, location.search],
  );

  const goTo = (page: "/login" | "/signup") => {
    if (returnTo) rememberReturnTo(returnTo);
    setReturnTo(null);
    navigate(page);
  };

  return (
    <LoginRequiredContext.Provider value={requireLogin}>
      {children}
      <Dialog open={returnTo !== null} onOpenChange={(open) => !open && setReturnTo(null)}>
        <DialogContent className="sm:max-w-sm text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-brand/10 text-brand flex items-center justify-center">
            <LogIn className="w-6 h-6" />
          </div>
          <DialogTitle className="text-xl">{t("login_required_title", "Log in to continue")}</DialogTitle>
          <DialogDescription>
            {t("login_required_message", "You need to be logged in to do this. After logging in, you'll come right back here.")}
          </DialogDescription>
          <div className="flex flex-col gap-2 pt-2">
            <Button onClick={() => goTo("/login")} className="w-full bg-brand hover:bg-brand/90 text-white font-semibold">
              {t("nav_login", "Log in")}
            </Button>
            <p className="text-sm text-muted-foreground">
              {t("login_required_no_account", "Don't have an account?")}{" "}
              <button type="button" onClick={() => goTo("/signup")} className="text-brand font-semibold hover:underline">
                {t("nav_signup", "Sign up")}
              </button>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </LoginRequiredContext.Provider>
  );
}
