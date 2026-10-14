import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { getImageUrl } from "@/utils";

const FALLBACK_AVATAR = "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600";

interface ReviewUser {
  id: string;
  name?: string | null;
  avatarUrl?: string | null;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  images?: string[];
  createdAt: string;
  author?: ReviewUser | null;
  // Set on brigade pages, where reviews of several members are listed together.
  target?: ReviewUser | null;
}

export function ReviewCard({ review }: { review: Review }) {
  const { t } = useTranslation();
  const images = review.images ?? [];
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const showImage = (delta: number) =>
    setOpenIndex((i) => (i === null ? i : (i + delta + images.length) % images.length));

  return (
    <div className="bg-slate-50 dark:bg-zinc-800/50 p-6 rounded-xl border border-slate-100 dark:border-zinc-800">
      <div className="flex items-center justify-between mb-4">
        <Link to={review.author?.id ? `/users/${review.author.id}` : "#"} className="flex items-center gap-3 group">
          <img src={getImageUrl(review.author?.avatarUrl) || FALLBACK_AVATAR} className="w-10 h-10 rounded-full object-cover" />
          <div>
            <div className="font-semibold text-slate-900 dark:text-foreground group-hover:text-brand transition-colors">{review.author?.name || t("anonymous", "Anonymous")}</div>
            <div className="text-xs text-slate-500 dark:text-gray-400">{format(new Date(review.createdAt), 'PP')}</div>
          </div>
        </Link>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'fill-orange-400 text-orange-400' : 'fill-slate-200 text-slate-200 dark:fill-zinc-700 dark:text-zinc-700'}`} />
          ))}
        </div>
      </div>

      {review.target && (
        <p className="text-xs text-slate-500 dark:text-gray-400 mb-2">
          {t("review_for_member", "Review for")}{" "}
          <Link to={`/masters/${review.target.id}`} className="font-medium text-brand hover:underline">
            {review.target.name || t("search_unnamed_master", "Unnamed Master")}
          </Link>
        </p>
      )}

      {review.comment && <p className="text-slate-600 dark:text-gray-300 text-sm leading-relaxed">{review.comment}</p>}

      {images.length > 0 && (
        <div className="flex gap-2 mt-4">
          {images.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setOpenIndex(i)}
              className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-zinc-700 hover:opacity-90 transition-opacity"
            >
              <img src={getImageUrl(url) || ""} alt={t("review_photo", "Review photo")} className="w-full h-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      <Dialog open={openIndex !== null} onOpenChange={(open) => !open && setOpenIndex(null)}>
        <DialogContent className="sm:max-w-3xl p-2 bg-black/95 border-none">
          <DialogTitle className="sr-only">{t("review_photo", "Review photo")}</DialogTitle>
          {openIndex !== null && (
            <div className="relative flex items-center justify-center">
              <img src={getImageUrl(images[openIndex]) || ""} alt={t("review_photo", "Review photo")} className="max-h-[80vh] w-auto object-contain rounded" />
              {images.length > 1 && (
                <>
                  <button type="button" onClick={() => showImage(-1)} className="absolute start-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2">
                    <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
                  </button>
                  <button type="button" onClick={() => showImage(1)} className="absolute end-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2">
                    <ChevronRight className="w-5 h-5 rtl:rotate-180" />
                  </button>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
