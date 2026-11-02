import type { MouseEvent } from "react";
import { useNavigate } from "react-router-dom";

// Makes a whole card open a page on click, for cards that contain their own
// buttons/links (a card can't be wrapped in a <Link> then). Clicks on those
// inner controls, on popups opened from the card, or while selecting text
// are left alone.
export function useCardLink() {
  const navigate = useNavigate();

  return (to: string) => (e: MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    // Popups (dropdown menus) render outside the card but React still bubbles their clicks here.
    if (!e.currentTarget.contains(target)) return;
    if (target.closest("a, button, input, select, textarea, [role='menuitem']")) return;
    if (window.getSelection()?.toString()) return;

    if (e.ctrlKey || e.metaKey) {
      window.open(to, "_blank", "noopener");
    } else {
      navigate(to);
    }
  };
}
