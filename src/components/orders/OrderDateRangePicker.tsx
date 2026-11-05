import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { DayPicker, type DateRange } from "react-day-picker";
import { format, isWithinInterval, parse, startOfToday } from "date-fns";
import { Label } from "@/components/ui/label";
import "react-day-picker/dist/style.css";

interface BusyRange {
  startDate: string;
  endDate: string;
}

interface OrderDateRangePickerProps {
  /** Dates as yyyy-MM-dd strings ("" when not picked). */
  startDate: string;
  endDate: string;
  onChange: (startDate: string, endDate: string) => void;
  busyDates?: BusyRange[];
}

const DATE_FORMAT = "yyyy-MM-dd";
const toDate = (value: string) => (value ? parse(value, DATE_FORMAT, new Date()) : undefined);

/**
 * One calendar for picking an order's dates: first click sets the start,
 * second click the end (same day twice = one-day job), a third click starts over.
 * Past days and busy days can't be picked, and a range can't cross a busy day.
 */
export function OrderDateRangePicker({ startDate, endDate, onChange, busyDates }: OrderDateRangePickerProps) {
  const { t } = useTranslation();
  const today = startOfToday();

  const isBusy = (date: Date) =>
    !!busyDates?.some((order) => {
      const start = new Date(order.startDate);
      const end = new Date(order.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return isWithinInterval(date, { start, end });
    });

  const selected: DateRange | undefined = startDate
    ? { from: toDate(startDate), to: toDate(endDate) }
    : undefined;

  const handleSelect = (range: DateRange | undefined) => {
    onChange(
      range?.from ? format(range.from, DATE_FORMAT) : "",
      range?.to ? format(range.to, DATE_FORMAT) : "",
    );
  };

  const display = (value: string) => {
    const date = toDate(value);
    return date ? format(date, "dd.MM.yyyy") : "—";
  };

  return (
    <div className="space-y-2">
      <Label>
        {t("start_date", "Start Date")} / {t("end_date", "End Date")} <span className="text-red-500">*</span>
      </Label>
      <div className="rounded-lg border p-3 flex flex-col items-center">
        <DayPicker
          mode="range"
          resetOnSelect
          excludeDisabled
          selected={selected}
          onSelect={handleSelect}
          disabled={[{ before: today }, isBusy]}
          startMonth={today}
          defaultMonth={toDate(startDate) ?? today}
          modifiers={{ busy: isBusy }}
          modifiersStyles={{ busy: { color: "white", backgroundColor: "#ef4444", opacity: 1 } }}
          style={{ "--rdp-accent-color": "var(--brand)", "--rdp-accent-background-color": "color-mix(in srgb, var(--brand) 15%, transparent)" } as CSSProperties}
        />
        <div className="mt-2 flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-gray-400">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span>{t("busy_days", "Busy Days")}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">{t("start_date", "Start Date")}: </span>
          <span className="font-medium">{display(startDate)}</span>
        </div>
        <div>
          <span className="text-muted-foreground">{t("end_date", "End Date")}: </span>
          <span className="font-medium">{display(endDate)}</span>
        </div>
      </div>
      {startDate && !endDate && (
        <p className="text-xs text-muted-foreground">
          {t("order_pick_end_date_hint", "Now click the end date (click the same day again for a one-day job).")}
        </p>
      )}
    </div>
  );
}
