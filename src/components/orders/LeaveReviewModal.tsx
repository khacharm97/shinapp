import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useCreateReviewMutation } from "@/store/api/authApi";
import { Star } from "lucide-react";
import { resolveApiErrorMessage } from "@/utils/api-errors";

interface LeaveReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  targetId: string;
}

export function LeaveReviewModal({ isOpen, onClose, orderId, targetId }: LeaveReviewModalProps) {
  const { t } = useTranslation();
  const [createReview, { isLoading }] = useCreateReviewMutation();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error(t("please_select_rating", "Please select a rating."));
      return;
    }

    try {
      await createReview({ orderId, targetId, rating, comment }).unwrap();
      toast.success(t("review_submitted", "Review submitted successfully!"));
      onClose();
    } catch (error: any  ) {
      toast.error(resolveApiErrorMessage(t, error?.data?.message) || t("review_submit_failed", "Failed to submit review."));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("leave_review", "Leave a Review")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="flex flex-col items-center gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-gray-300">{t("rating", "Rating")}</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoverRating || rating)
                        ? "fill-orange-400 text-orange-400"
                        : "fill-slate-200 text-slate-200 dark:fill-zinc-700 dark:text-zinc-700"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="comment" className="text-sm font-medium text-slate-700 dark:text-gray-300">
              {t("comment_optional", "Comment (Optional)")}
            </label>
            <Textarea
              id="comment"
              placeholder={t("write_review_placeholder", "Write your experience...")}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              {t("cancel", "Cancel")}
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-brand hover:bg-brand/90">
              {isLoading ? t("submitting", "Submitting...") : t("submit_review", "Submit Review")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
