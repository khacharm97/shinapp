import { createContext, useContext } from "react";

// Opens the "you need to log in" dialog. Pass the page to come back to after
// logging in; it defaults to the current page.
export type RequireLogin = (returnTo?: string) => void;

export const LoginRequiredContext = createContext<RequireLogin>(() => {});

export function useRequireLogin(): RequireLogin {
  return useContext(LoginRequiredContext);
}
