import type { TFunction } from "i18next";

// The backend returns a stable code (not a human sentence) for a handful of
// errors that need to be shown in the user's language, the same way
// auth_error_user_blocked already works. Anything else is assumed to already
// be a plain message and is shown as-is.
const API_ERROR_CODES: Record<string, string> = {
  order_master_busy: "This master already has an active job and cannot take on another one at the same time.",
  order_master_unavailable: "This master has marked themselves unavailable for these dates.",
  order_technique_busy: "\"{{technique}}\" is already booked for these dates.",
  order_technique_owner_busy: "The owner of \"{{technique}}\" already has an active job for these dates and cannot take on another one.",
  order_technique_owner_unavailable: "The owner of \"{{technique}}\" is unavailable for these dates.",
  order_technique_not_found: "Technique not found.",
  order_technique_own: "You cannot order your own technique.",
  order_cancelled: "This order was cancelled.",
  order_not_pending: "This order is no longer waiting for a response.",
  order_cancel_not_pending: "Only orders still waiting for a response can be cancelled.",
  order_cancel_not_sender: "Only the person who sent this offer can cancel it. You can reject it instead.",
  busy_day_end_before_start: "End date must be after start date.",
  busy_day_invalid_dates: "A valid start and end date are required.",
  review_order_not_found: "Order not found.",
  review_order_not_completed: "Order must be completed to leave a review.",
  review_already_exists: "You have already left a review for this order.",
  review_not_order_party: "Only the client and the master of this order can leave a review.",
  review_invalid_target: "You can only review the other party of this order.",
  review_images_invalid: "Only image files can be attached to a review.",
};

// `params` fills placeholders in the message, e.g. { technique: "Excavator" }
// for the order_technique_* codes.
export function resolveApiErrorMessage(
  t: TFunction,
  message?: string | null,
  params?: Record<string, unknown>,
): string | undefined {
  if (!message) return undefined;
  const fallback = API_ERROR_CODES[message];
  return fallback ? t(message, { defaultValue: fallback, ...params }) : message;
}
