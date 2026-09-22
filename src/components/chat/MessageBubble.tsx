import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types";

export function MessageBubble({ message, mine }: { message: ChatMessage; mine: boolean }) {
  return (
    <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words",
          mine
            ? "bg-brand text-white rounded-br-sm"
            : "bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-gray-100 rounded-bl-sm"
        )}
      >
        {message.body}
        <div className={cn("text-[10px] mt-1", mine ? "text-white/70" : "text-slate-400 dark:text-zinc-500")}>
          {format(new Date(message.createdAt), "HH:mm")}
        </div>
      </div>
    </div>
  );
}
