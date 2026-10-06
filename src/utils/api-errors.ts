import type { TFunction } from "i18next";

// The backend returns a stable code (not a human sentence) for a handful of
// errors that need to be shown in the user's language, the same way
// auth_error_user_blocked already works. Anything else is assumed to already
// be a plain message and is shown as-is.
const API_ERROR_CODES: Record<string, string> = {
  order_master_busy: "This master already has an active job and cannot take on another one at the same time.",
  order_master_unavailable: "This master has marked themselves unavailable for these dates.",
  busy_day_end_before_start: "End date must be after start date.",
  busy_day_invalid_dates: "A valid start and end date are required.",
  review_order_not_found: "Order not found.",
  review_order_not_completed: "Order must be completed to leave a review.",
  review_already_exists: "You have already left a review for this order.",
};

export function resolveApiErrorMessage(t: TFunction, message?: string | null): string | undefined {
  if (!message) return undefined;
  const fallback = API_ERROR_CODES[message];
  return fallback ? t(message, fallback) : message;
}
