import { useState, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface ImageViewerProps {
  images: string[];
  // Which image is open; null means the viewer is closed.
  index: number | null;
  onIndexChange: (index: number | null) => void;
  title: string;
}

// Shows photos large over the page, with previous/next when there are several.
export function ImageViewer({ images, index, onIndexChange, title }: ImageViewerProps) {
  const { t } = useTranslation();
  const open = index !== null && images.length > 0;
  // Keep showing the last photo while the viewer fades out.
  const [lastIndex, setLastIndex] = useState(0);
  if (index !== null && index !== lastIndex) setLastIndex(index);
  const current = Math.min(index ?? lastIndex, Math.max(images.length - 1, 0));
  const hasMany = images.length > 1;

  const go = (step: 1 | -1) => onIndexChange((current + step + images.length) % images.length);

  const onKeyDown = (e: KeyboardEvent) => {
    if (!hasMany || (e.key !== "ArrowLeft" && e.key !== "ArrowRight")) return;
    e.preventDefault();
    // In right-to-left languages the "previous" arrow is on the right.
    const rtl = document.documentElement.dir === "rtl";
    go((e.key === "ArrowRight") !== rtl ? 1 : -1);
  };

  const arrowClass =
    "absolute top-1/2 -translate-y-1/2 rounded-full bg-white/90 dark:bg-zinc-900/90 text-slate-700 dark:text-gray-200 shadow-md p-2 hover:bg-white dark:hover:bg-zinc-800 transition-colors";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onIndexChange(null)}>
      <DialogContent
        showCloseButton={false}
        onKeyDown={onKeyDown}
        className="w-auto max-w-[95vw] sm:max-w-[95vw] p-0 border-none bg-transparent shadow-none"
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        {images.length > 0 && (
          <img
            src={images[current]}
            alt={hasMany ? `${title} ${current + 1}/${images.length}` : title}
            // The minimum size keeps the viewer from collapsing to a speck while a photo loads.
            className="max-w-[95vw] max-h-[85vh] min-w-[min(20rem,95vw)] min-h-48 w-auto h-auto rounded-xl object-contain bg-white dark:bg-zinc-900"
          />
        )}

        {hasMany && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label={t("previous_photo", "Previous photo")} className={`${arrowClass} start-2`}>
              <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
            </button>
            <button type="button" onClick={() => go(1)} aria-label={t("next_photo", "Next photo")} className={`${arrowClass} end-2`}>
              <ChevronRight className="w-5 h-5 rtl:rotate-180" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 text-white text-xs font-medium px-2.5 py-1">
              {current + 1} / {images.length}
            </div>
          </>
        )}

        <DialogClose
          aria-label={t("close", "Close")}
          className="absolute -top-3 -end-3 rounded-full bg-white dark:bg-zinc-900 text-slate-700 dark:text-gray-200 shadow-md p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
