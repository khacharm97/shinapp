import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, LifeBuoy, MessageCircle, Send, X } from "lucide-react";
import { toast } from "sonner";
import {
  chatApi,
  useCreateGuestSessionMutation,
  useGetConversationsQuery,
  useGetMessagesQuery,
  useGetUnreadCountQuery,
  useSendMessageMutation,
  useMarkConversationReadMutation,
} from "@/store/api/chatApi";
import { setGuestSession } from "@/store/slices/guestChatSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Button } from "@/components/ui/button";
import { MessageBubble } from "@/components/chat/MessageBubble";

export function SupportWidget({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const authToken = useAppSelector((s) => s.auth.token);
  const authUserId = useAppSelector((s) => s.auth.user?.id);
  const guest = useAppSelector((s) => s.guestChat);
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // A visitor who isn't logged in chats through a guest session, which only
  // gets created when they send their first message.
  const isGuest = !authToken;
  const hasSession = !!authToken || !!guest.token;
  const myId = isGuest ? guest.userId ?? undefined : authUserId;

  // Logging in or out while a guest session exists switches which identity
  // chat runs as - drop the caches and the socket opened under the old one.
  const lastAuthToken = useRef(authToken);
  useEffect(() => {
    if (lastAuthToken.current === authToken) return;
    lastAuthToken.current = authToken;
    if (guest.token) dispatch(chatApi.util.resetApiState());
  }, [authToken, guest.token, dispatch]);

  const { data: conversations } = useGetConversationsQuery(undefined, { skip: !hasSession });
  // This query owns the realtime socket; for a guest nothing else mounts it.
  useGetUnreadCountQuery(undefined, { skip: !hasSession });
  // A Resolved conversation is left alone — the next message starts a fresh
  // one, so only ever surface the current (non-Resolved) thread here.
  const supportConversation = hasSession
    ? conversations?.find((c) => c.type === "SUPPORT" && c.status !== "RESOLVED")
    : undefined;
  const conversationId = supportConversation?.id;
  const unread = supportConversation?.unreadCount ?? 0;

  const { data: messages, isLoading } = useGetMessagesQuery(conversationId as string, {
    skip: !conversationId || !open,
  });
  const [createGuestSession, { isLoading: isStartingSession }] = useCreateGuestSessionMutation();
  const [sendMessage, { isLoading: isSendingMessage }] = useSendMessageMutation();
  const isSending = isStartingSession || isSendingMessage;
  const [markRead] = useMarkConversationReadMutation();

  useEffect(() => {
    if (open && conversationId && unread > 0) {
      markRead(conversationId);
    }
  }, [open, conversationId, unread, markRead]);

  useEffect(() => {
    if (open) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [open, messages?.length]);

  const handleSend = async () => {
    const body = text.trim();
    if (!body || isSending) return;
    try {
      if (!hasSession) {
        const session = await createGuestSession().unwrap();
        dispatch(setGuestSession({ token: session.token, userId: session.user.id }));
      }
      await sendMessage(
        conversationId ? { conversationId, body } : { type: "SUPPORT", body }
      ).unwrap();
      setText("");
    } catch {
      // keep the text so the user can retry
      toast.error(t("support_chat_send_failed", "Couldn't send your message. Please try again."));
    }
  };

  return (
    <div className="fixed bottom-5 end-5 z-40 flex flex-col items-end gap-3">
      {open && (
        <div className="w-[calc(100vw-2.5rem)] max-w-sm h-[28rem] max-h-[70vh] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200">
          <div className="flex items-center justify-between gap-2 px-4 py-3 bg-brand text-white shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <LifeBuoy className="w-5 h-5 shrink-0" />
              <span className="font-semibold">{t("support_chat", "Support")}</span>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              aria-label={t("close", "Close")}
              className="opacity-80 hover:opacity-100 transition-opacity"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50 dark:bg-background">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-brand" />
              </div>
            ) : messages && messages.length > 0 ? (
              messages.map((m) => <MessageBubble key={m.id} message={m} mine={m.senderId === myId} />)
            ) : (
              <div className="text-center text-slate-400 dark:text-zinc-500 text-sm py-8 px-4">
                {t("support_chat_empty", "Send us a message and we'll get back to you soon.")}
              </div>
            )}
            {isGuest && (
              <div className="text-center text-slate-400 dark:text-zinc-500 text-xs px-4">
                {t("support_chat_guest_hint", "You're chatting as a guest. Our reply will appear here, in this browser.")}
              </div>
            )}
          </div>

          <div className="p-2.5 border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-end gap-2 shrink-0">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={1}
              placeholder={t("type_a_message", "Type a message...")}
              className="flex-1 resize-none max-h-24 rounded-xl border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-foreground dark:placeholder:text-zinc-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
            />
            <Button onClick={handleSend} disabled={!text.trim() || isSending} size="icon" className="bg-brand hover:bg-brand/90 text-white rounded-xl shrink-0">
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      )}

      <button
        onClick={() => onOpenChange(!open)}
        aria-label={t("contact_support", "Contact Support")}
        className="relative h-14 w-14 rounded-full bg-brand text-white shadow-lg flex items-center justify-center hover:bg-brand/90 hover:scale-105 transition-transform"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 px-1 items-center justify-center rounded-full bg-destructive text-[11px] font-bold text-destructive-foreground">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
    </div>
  );
}
