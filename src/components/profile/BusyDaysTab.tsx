import { useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Plus, Loader2, CalendarOff, Trash2 } from "lucide-react";
import {
  useGetMyBusyDaysQuery,
  useAddBusyDayMutation,
  useDeleteBusyDayMutation,
} from "@/store/api/authApi";
import { resolveApiErrorMessage } from "@/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export function BusyDaysTab({ className = "mt-8" }: { className?: string }) {
  const { t } = useTranslation();
  const { data: busyDays, isLoading } = useGetMyBusyDaysQuery();
  const [addBusyDay, { isLoading: isAdding }] = useAddBusyDayMutation();
  const [deleteBusyDay] = useDeleteBusyDayMutation();

  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [note, setNote] = useState("");

  const resetForm = () => {
    setStartDate("");
    setEndDate("");
    setNote("");
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      toast.error(t("fill_required_fields", "Please fill in all required fields."));
      return;
    }
    try {
      await addBusyDay({ startDate, endDate, note: note || undefined }).unwrap();
      toast.success(t("busy_day_added", "Busy period added."));
      resetForm();
      setIsOpen(false);
    } catch (error: any) {
      toast.error(resolveApiErrorMessage(t, error?.data?.message) || t("busy_day_add_failed", "Failed to add busy period."));
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t("busy_day_delete_confirm", "Remove this busy period?"))) return;
    try {
      await deleteBusyDay(id).unwrap();
    } catch (error: any) {
      toast.error(resolveApiErrorMessage(t, error?.data?.message) || t("busy_day_delete_failed", "Failed to remove busy period."));
    }
  };

  return (
    <div className={`w-full bg-white dark:bg-card p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-border ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-slate-900 dark:text-foreground">
          {t("busy_days_title", "Busy Days")}
        </h2>
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <Button variant="outline" onClick={() => setIsOpen(true)}>
            <Plus className="w-4 h-4 me-2" />
            {t("busy_days_add_btn", "Add Busy Period")}
          </Button>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("busy_days_add_title", "Add Busy Period")}</DialogTitle>
              <DialogDescription>
                {t("busy_days_add_desc", "Mark yourself unavailable for a date range - vacation, a job outside the platform, etc. Clients won't be able to book you for these dates.")}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="busy-start">{t("start_date", "Start Date")} <span className="text-red-500">*</span></Label>
                  <Input id="busy-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="busy-end">{t("end_date", "End Date")} <span className="text-red-500">*</span></Label>
                  <Input id="busy-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="busy-note">{t("busy_days_note_label", "Note")} ({t("optional", "Optional")})</Label>
                <Input
                  id="busy-note"
                  placeholder={t("busy_days_note_placeholder", "e.g. Vacation")}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => { setIsOpen(false); resetForm(); }}>
                  {t("cancel", "Cancel")}
                </Button>
                <Button type="submit" disabled={isAdding}>
                  {isAdding ? t("submitting", "Submitting...") : t("add", "Add")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <p className="text-sm text-slate-500 dark:text-gray-400 mb-6">
        {t("busy_days_subtitle", "Days you manually mark as busy - clients won't be able to book you for them.")}
      </p>

      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-6 h-6 animate-spin text-brand" />
        </div>
      ) : busyDays && busyDays.length > 0 ? (
        <div className="flex flex-col gap-2">
          {busyDays.map((period) => (
            <div
              key={period.id}
              className="flex items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-zinc-900 rounded-md border border-slate-100 dark:border-zinc-800"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-foreground">
                  {format(new Date(period.startDate), "MMM d, yyyy")} - {format(new Date(period.endDate), "MMM d, yyyy")}
                </p>
                {period.note && (
                  <p className="text-xs text-slate-500 dark:text-gray-400 truncate">{period.note}</p>
                )}
              </div>
              <button
                onClick={() => handleDelete(period.id)}
                className="text-slate-400 dark:text-zinc-500 hover:text-red-500 rounded-full p-1 shrink-0"
                aria-label={t("busy_days_delete_btn", "Remove")}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400 dark:text-zinc-500">
          <CalendarOff className="w-8 h-8 mb-2" />
          <p className="text-sm">{t("busy_days_empty", "No manually-added busy periods yet.")}</p>
        </div>
      )}
    </div>
  );
}
