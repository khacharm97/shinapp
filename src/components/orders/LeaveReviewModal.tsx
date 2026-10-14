import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useCreateReviewMutation } from "@/store/api/authApi";
import { Star, Upload, X } from "lucide-react";
import { resolveApiErrorMessage } from "@/utils/api-errors";

const MAX_IMAGES = 3;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB, matches the backend limit

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
  const [images, setImages] = useState<File[]>([]);

  const previews = useMemo(() => images.map((file) => URL.createObjectURL(file)), [images]);
  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = ""; // allow picking the same file again after removing it
    const valid = picked.filter((file) => file.type.startsWith("image/") && file.size <= MAX_IMAGE_SIZE);
    if (valid.length < picked.length) {
      toast.error(t("review_images_too_large", "Only images up to 10 MB can be added."));
    }
    if (images.length + valid.length > MAX_IMAGES) {
      toast.error(t("review_images_max", "You can add up to {{count}} photos.", { count: MAX_IMAGES }));
    }
    setImages((prev) => [...prev, ...valid].slice(0, MAX_IMAGES));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error(t("please_select_rating", "Please select a rating."));
      return;
    }

    const formData = new FormData();
    formData.append("orderId", orderId);
    formData.append("targetId", targetId);
    formData.append("rating", String(rating));
    if (comment) formData.append("comment", comment);
    images.forEach((file) => formData.append("images", file));

    try {
      await createReview(formData).unwrap();
      toast.success(t("review_submitted", "Review submitted successfully!"));
      setComment("");
      setImages([]);
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-gray-300">
              {t("review_photos_optional", "Photos of the work (Optional, up to 3)")}
            </label>
            <div className="flex flex-wrap items-center gap-3">
              {previews.map((url, i) => (
                <div key={url} className="relative w-20 h-20 rounded-lg overflow-hidden border">
                  <img src={url} alt={t("review_photo", "Review photo")} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {images.length < MAX_IMAGES && (
                <label className="flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <Upload className="w-5 h-5 text-muted-foreground mb-1" />
                  <span className="text-[10px] text-muted-foreground">{images.length}/{MAX_IMAGES}</span>
                  <input type="file" className="hidden" accept="image/*" multiple onChange={handleImagesChange} />
                </label>
              )}
            </div>
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
