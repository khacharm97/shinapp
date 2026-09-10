import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatDistanceToNow, format } from "date-fns";
import { Loader2, Send, ArrowLeft, MessageSquare } from "lucide-react";
import {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useMarkConversationReadMutation,
} from "@/store/api/chatApi";
import { useAppSelector } from "@/store/hooks";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/seo";
import { getImageUrl } from "@/utils";
import { cn } from "@/lib/utils";
import type { ChatMessage, Conversation, ConversationType } from "@/types";

function Avatar({ name, url, size = 40 }: { name?: string | null; url?: string | null; size?: number }) {
  return (
    <div
      className="rounded-full overflow-hidden bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-slate-500 dark:text-gray-400 font-semibold flex-shrink-0"
      style={{ width: size, height: size }}
    >
      {url ? (
        <img src={getImageUrl(url) || ""} alt={name || ""} className="w-full h-full object-cover" />
      ) : (
        <span style={{ fontSize: size * 0.4 }}>{(name || "?").charAt(0).toUpperCase()}</span>
      )}
    </div>
  );
}

function ConversationRow({
  conversation,
  active,
}: {
  conversation: Conversation;
  active: boolean;
}) {
  const { t } = useTranslation();
  const other = conversation.otherParticipants[0];
  const name = other?.name || t("unknown_user", "Unknown");
  return (
    <Link
      to={`/messages/${conversation.id}`}
      className={cn(
        "flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-zinc-800 transition-colors",
        active ? "bg-brand/5 dark:bg-brand/10" : "hover:bg-slate-50 dark:hover:bg-zinc-800/50"
      )}
    >
      <Avatar name={name} url={other?.avatarUrl} />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline gap-2">
          <span className="font-semibold text-slate-900 dark:text-foreground truncate">{name}</span>
          {conversation.lastMessage && (
            <span className="text-[11px] text-slate-400 dark:text-zinc-500 flex-shrink-0">
              {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), { addSuffix: false })}
            </span>
          )}
        </div>
        <div className="flex justify-between items-center gap-2">
          <span className="text-sm text-slate-500 dark:text-gray-400 truncate">
            {conversation.lastMessage?.body || t("no_messages_yet", "No messages yet")}
          </span>
          {conversation.unreadCount > 0 && (
            <span className="flex-shrink-0 bg-brand text-white text-[11px] font-bold min-w-5 h-5 px-1.5 rounded-full flex items-center justify-center">
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function MessageBubble({ message, mine }: { message: ChatMessage; mine: boolean }) {
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

function Thread({
  conversationId,
  draftRecipient,
}: {
  conversationId?: string;
  draftRecipient?: {
    recipientId: string;
    type: ConversationType;
    name: string;
    avatarUrl?: string;
    announcementId?: string;
    orderId?: string;
  };
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const myId = useAppSelector((s) => s.auth.user?.id);
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: conversations } = useGetConversationsQuery();
  const conversation = conversations?.find((c) => c.id === conversationId);

  const { data: messages, isLoading } = useGetMessagesQuery(conversationId as string, {
    skip: !conversationId,
  });
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();
  const [markRead] = useMarkConversationReadMutation();

  useEffect(() => {
    if (conversationId && messages && messages.length > 0) {
      markRead(conversationId);
    }
  }, [conversationId, messages, markRead]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages?.length]);

  const other = conversation?.otherParticipants[0];
  const headerName = other?.name || draftRecipient?.name || t("select_conversation", "Select a conversation");
  const headerAvatar = other?.avatarUrl || draftRecipient?.avatarUrl;

  const handleSend = async () => {
    const body = text.trim();
    if (!body || isSending) return;
    try {
      const res = await sendMessage(
        conversationId
          ? { conversationId, body }
          : {
              recipientId: draftRecipient!.recipientId,
              type: draftRecipient!.type,
              announcementId: draftRecipient!.announcementId,
              orderId: draftRecipient!.orderId,
              body,
            }
      ).unwrap();
      setText("");
      if (!conversationId) {
        navigate(`/messages/${res.conversationId}`, { replace: true });
      }
    } catch {
      // keep the text so the user can retry
    }
  };

  if (!conversationId && !draftRecipient) {
    return (
      <div className="hidden md:flex flex-1 flex-col items-center justify-center text-center text-slate-400 dark:text-zinc-500 p-8">
        <MessageSquare className="w-12 h-12 mb-3 text-slate-300 dark:text-zinc-600" />
        <p>{t("select_conversation", "Select a conversation to start chatting")}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 dark:bg-background">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <button onClick={() => navigate("/messages")} className="md:hidden text-slate-500 dark:text-gray-400">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <Avatar name={headerName} url={headerAvatar} size={36} />
        <span className="font-semibold text-slate-900 dark:text-foreground">{headerName}</span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-brand" />
          </div>
        ) : messages && messages.length > 0 ? (
          messages.map((m) => <MessageBubble key={m.id} message={m} mine={m.senderId === myId} />)
        ) : (
          <div className="text-center text-slate-400 dark:text-zinc-500 text-sm py-8">
            {t("no_messages_yet_start", "No messages yet. Say hello!")}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-end gap-2">
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
          className="flex-1 resize-none max-h-32 rounded-xl border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-foreground dark:placeholder:text-zinc-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
        />
        <Button onClick={handleSend} disabled={!text.trim() || isSending} size="icon" className="bg-brand hover:bg-brand/90 text-white rounded-xl">
          {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}

export default function MessagesPageContent() {
  const { t } = useTranslation();
  const { conversationId } = useParams<{ conversationId: string }>();
  const [searchParams] = useSearchParams();
  const { data: conversations, isLoading } = useGetConversationsQuery();

  const isNew = conversationId === "new";
  const draftRecipient = useMemo(() => {
    if (!isNew) return undefined;
    const recipientId = searchParams.get("recipientId");
    if (!recipientId) return undefined;
    return {
      recipientId,
      type: (searchParams.get("type") as ConversationType) || "USER_MASTER",
      name: searchParams.get("recipientName") || t("new_message", "New message"),
      avatarUrl: searchParams.get("recipientAvatar") || undefined,
      announcementId: searchParams.get("announcementId") || undefined,
      orderId: searchParams.get("orderId") || undefined,
    };
  }, [isNew, searchParams, t]);

  const activeId = isNew ? undefined : conversationId;
  const showThreadOnMobile = !!conversationId;

  return (
    <div className="flex-1 w-full bg-slate-50 dark:bg-background min-h-[calc(100vh-140px)] py-6 px-0 sm:px-6 lg:px-8">
      <SEO title={t("messages", "Messages")} />
      <div className="max-w-6xl mx-auto h-[calc(100vh-200px)] bg-white dark:bg-zinc-900 sm:rounded-2xl sm:border sm:border-slate-200 dark:sm:border-zinc-800 sm:shadow-sm overflow-hidden flex">
        {/* Conversation list */}
        <div
          className={cn(
            "w-full md:w-80 md:border-r border-slate-200 dark:border-zinc-800 flex flex-col min-h-0",
            showThreadOnMobile ? "hidden md:flex" : "flex"
          )}
        >
          <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800">
            <h1 className="font-bold text-lg text-slate-900 dark:text-foreground">{t("messages", "Messages")}</h1>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-brand" />
              </div>
            ) : conversations && conversations.length > 0 ? (
              conversations.map((c) => (
                <ConversationRow key={c.id} conversation={c} active={c.id === activeId} />
              ))
            ) : (
              <div className="text-center text-slate-400 dark:text-zinc-500 text-sm py-10 px-4">
                {t("no_conversations", "No conversations yet.")}
              </div>
            )}
          </div>
        </div>

        {/* Thread */}
        <div
          className={cn(
            "flex-1 flex flex-col min-h-0",
            showThreadOnMobile ? "flex" : "hidden md:flex"
          )}
        >
          <Thread conversationId={activeId} draftRecipient={draftRecipient} />
        </div>
      </div>
    </div>
  );
}
