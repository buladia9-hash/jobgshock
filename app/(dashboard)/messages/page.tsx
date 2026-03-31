'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ID, Query } from 'appwrite';
import {
  ArrowUpRight,
  Clock3,
  Inbox,
  MessageSquare,
  Search,
  SendHorizontal,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/auth';
import { databases } from '@/lib/appwrite';
import type { Message } from '@/types';

type PortalMessage = Message & {
  senderName?: string;
  receiverName?: string;
};

type ConversationSummary = {
  userId: string;
  userName: string;
  unreadCount: number;
  lastMessage?: string;
  lastTime?: string;
};

const messageTimeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: '2-digit',
});

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
});

function isSameDay(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

function formatConversationTime(value?: string) {
  if (!value) return '';

  const date = new Date(value);
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  if (isSameDay(date, now)) return messageTimeFormatter.format(date);
  if (isSameDay(date, yesterday)) return 'Yesterday';
  return dateFormatter.format(date);
}

function formatMessageDay(value: string) {
  const date = new Date(value);
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  if (isSameDay(date, now)) return 'Today';
  if (isSameDay(date, yesterday)) return 'Yesterday';
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function getInitials(name?: string) {
  const initials = (name || 'Unknown User')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return initials || 'U';
}

function MessagesContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeConvo, setActiveConvo] = useState<ConversationSummary | null>(null);
  const [messages, setMessages] = useState<PortalMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const userNameCache = useRef<Map<string, string>>(new Map());

  const toId = searchParams.get('to');
  const toName = searchParams.get('name');

  const getUserName = async (userId: string) => {
    const cached = userNameCache.current.get(userId);
    if (cached) return cached;

    try {
      const userDoc = (await databases.getDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
        userId
      )) as { name?: string };
      const name = userDoc.name || 'Unknown User';
      userNameCache.current.set(userId, name);
      return name;
    } catch {
      return 'Unknown User';
    }
  };

  const enrichConversations = async (items: ConversationSummary[]) => {
    const missingIds = items
      .filter((item) => !item.userName)
      .map((item) => item.userId);

    if (missingIds.length > 0) {
      await Promise.all(missingIds.map((id) => getUserName(id)));
    }

    return items.map((item) => ({
      ...item,
      userName: item.userName || userNameCache.current.get(item.userId) || 'Unknown User',
    }));
  };

  const loadConversations = async () => {
    if (!user) return;
    setLoadingConversations(true);

    try {
      const [sent, received] = await Promise.all([
        databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID!,
          [Query.equal('senderId', user.$id), Query.orderDesc('createdAt'), Query.limit(100)]
        ),
        databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID!,
          [Query.equal('receiverId', user.$id), Query.orderDesc('createdAt'), Query.limit(100)]
        ),
      ]);

      const allMessages = [...sent.documents, ...received.documents] as unknown as PortalMessage[];
      const convoMap = new Map<string, ConversationSummary>();

      allMessages.forEach((msg) => {
        const otherId = msg.senderId === user.$id ? msg.receiverId : msg.senderId;
        const otherName = msg.senderId === user.$id ? msg.receiverName : msg.senderName;
        const unreadIncrement = msg.receiverId === user.$id && !msg.read ? 1 : 0;

        if (!convoMap.has(otherId)) {
          convoMap.set(otherId, {
            userId: otherId,
            userName: otherName || 'Unknown User',
            lastMessage: msg.content,
            lastTime: msg.createdAt,
            unreadCount: unreadIncrement,
          });
          return;
        }

        const existing = convoMap.get(otherId)!;
        existing.unreadCount += unreadIncrement;

        if (existing.lastTime && new Date(msg.createdAt) > new Date(existing.lastTime)) {
          existing.userName = otherName || existing.userName;
          existing.lastMessage = msg.content;
          existing.lastTime = msg.createdAt;
        }
      });

      const convoList = await enrichConversations(Array.from(convoMap.values()));
      const sorted = convoList.sort(
        (a, b) => new Date(b.lastTime ?? 0).getTime() - new Date(a.lastTime ?? 0).getTime()
      );
      setConversations(sorted);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoadingConversations(false);
    }
  };

  const loadMessages = async (otherId: string) => {
    if (!user) return;
    setLoadingMessages(true);

    try {
      const [sent, received] = await Promise.all([
        databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID!,
          [
            Query.equal('senderId', user.$id),
            Query.equal('receiverId', otherId),
            Query.orderAsc('createdAt'),
            Query.limit(100),
          ]
        ),
        databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID!,
          [
            Query.equal('senderId', otherId),
            Query.equal('receiverId', user.$id),
            Query.orderAsc('createdAt'),
            Query.limit(100),
          ]
        ),
      ]);

      const all = ([...sent.documents, ...received.documents].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ) as unknown) as PortalMessage[];
      setMessages(all);

      const unreadMessages = received.documents.filter((msg) => !msg.read);
      if (unreadMessages.length > 0) {
        await Promise.all(
          unreadMessages.map((msg) =>
            databases.updateDocument(
              process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
              process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID!,
              msg.$id,
              { read: true }
            )
          )
        );
        void loadConversations();
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !activeConvo) return;
    setSending(true);

    try {
      await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID!,
        ID.unique(),
        {
          senderId: user.$id,
          receiverId: activeConvo.userId,
          content: newMessage.trim(),
          read: false,
          createdAt: new Date().toISOString(),
        }
      );

      setNewMessage('');
      await Promise.all([loadMessages(activeConvo.userId), loadConversations()]);
    } catch (error: unknown) {
      console.error('Failed to send message:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (user) {
      void loadConversations();
    }
  }, [user]);

  useEffect(() => {
    if (!toId || !user) return;

    const openConversation = async () => {
      const resolvedName = toName || (await getUserName(toId));
      const convo: ConversationSummary = {
        userId: toId,
        userName: resolvedName,
        unreadCount: 0,
      };

      setActiveConvo(convo);
      await loadMessages(toId);
    };

    void openConversation();
  }, [toId, toName, user?.$id]);

  useEffect(() => {
    if (toId || activeConvo || conversations.length === 0) return;

    const firstConversation = conversations[0];
    setActiveConvo(firstConversation);
    void loadMessages(firstConversation.userId);
  }, [conversations, activeConvo, toId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!activeConvo) return;

    const interval = setInterval(() => {
      void loadMessages(activeConvo.userId);
    }, 3000);

    return () => clearInterval(interval);
  }, [activeConvo]);

  if (!user) return null;

  const filteredConversations = conversations.filter((convo) => {
    const value = `${convo.userName} ${convo.lastMessage || ''}`.toLowerCase();
    return value.includes(searchTerm.toLowerCase());
  });

  const activeConversationName = activeConvo?.userName || 'Messages';
  const totalUnreadCount = conversations.reduce((total, convo) => total + convo.unreadCount, 0);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-6 py-7 text-white shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              Professional inbox
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Messages</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 md:text-base">
              Keep conversations organized, respond faster, and stay on top of every
              candidate or recruiter touchpoint.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Conversations</p>
              <p className="mt-2 text-2xl font-semibold">{conversations.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Unread</p>
              <p className="mt-2 text-2xl font-semibold">{totalUnreadCount}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[360px,minmax(0,1fr)]">
        <aside className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Inbox
                </p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">Recent conversations</h2>
              </div>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {filteredConversations.length} visible
              </span>
            </div>

            <label className="relative mt-4 block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search people or messages"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100"
              />
            </label>
          </div>

          <div className="max-h-[720px] overflow-y-auto p-3">
            {loadingConversations ? (
              <div className="space-y-3 p-2">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="animate-pulse rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-2xl bg-slate-200" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-1/2 rounded bg-slate-200" />
                        <div className="h-3 w-3/4 rounded bg-slate-200" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
                <Inbox className="h-12 w-12 text-slate-300" />
                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  {searchTerm ? 'No matches found' : 'No conversations yet'}
                </h3>
                <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
                  {searchTerm
                    ? 'Try a different name or phrase to find an existing conversation.'
                    : 'Your active conversations will appear here once you start messaging.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredConversations.map((convo) => {
                  const isActive = activeConvo?.userId === convo.userId;

                  return (
                    <button
                      key={convo.userId}
                      onClick={() => {
                        setActiveConvo(convo);
                        void loadMessages(convo.userId);
                      }}
                      className={`w-full rounded-2xl border p-4 text-left transition-all ${
                        isActive
                          ? 'border-primary-200 bg-primary-50 shadow-sm'
                          : 'border-transparent bg-white hover:border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-sm font-semibold ${
                            isActive
                              ? 'bg-primary-600 text-white'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {getInitials(convo.userName)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-900">
                                {convo.userName}
                              </p>
                              <p className="mt-1 truncate text-sm text-slate-500">
                                {convo.lastMessage || 'No messages yet'}
                              </p>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                              <span className="whitespace-nowrap text-xs font-medium text-slate-400">
                                {formatConversationTime(convo.lastTime)}
                              </span>
                              {convo.unreadCount > 0 && (
                                <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-primary-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                                  {convo.unreadCount}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        <section className="flex min-h-[720px] flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          {activeConvo ? (
            <>
              <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-4 backdrop-blur">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white shadow-sm">
                      {getInitials(activeConversationName)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {activeConversationName}
                        </h3>
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                          Active
                        </span>
                      </div>
                      <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                        <Clock3 className="h-4 w-4" />
                        Secure direct conversation
                      </p>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500">
                    <ArrowUpRight className="h-4 w-4 text-slate-400" />
                    Messages sync automatically
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.08),_transparent_32%),linear-gradient(to_bottom,_#ffffff,_#f8fafc)] px-4 py-5 sm:px-6">
                {loadingMessages ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className={`flex ${item % 2 === 0 ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className="max-w-md animate-pulse rounded-3xl bg-slate-200 px-5 py-4">
                          <div className="h-4 w-48 rounded bg-slate-300" />
                          <div className="mt-2 h-3 w-20 rounded bg-slate-300" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full min-h-[420px] flex-col items-center justify-center text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-primary-50 text-primary-600">
                      <MessageSquare className="h-10 w-10" />
                    </div>
                    <h3 className="mt-6 text-2xl font-semibold text-slate-900">
                      Start the conversation
                    </h3>
                    <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
                      Send a thoughtful first message to introduce yourself, share context,
                      or move the hiring conversation forward.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg, index) => {
                      const previous = messages[index - 1];
                      const isOwn = msg.senderId === user.$id;
                      const showDayDivider =
                        !previous ||
                        !isSameDay(new Date(previous.createdAt), new Date(msg.createdAt));

                      return (
                        <div key={msg.$id}>
                          {showDayDivider && (
                            <div className="my-6 flex items-center gap-4">
                              <div className="h-px flex-1 bg-slate-200" />
                              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 shadow-sm">
                                {formatMessageDay(msg.createdAt)}
                              </span>
                              <div className="h-px flex-1 bg-slate-200" />
                            </div>
                          )}

                          <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            <div
                              className={`flex max-w-[85%] flex-col ${isOwn ? 'items-end' : 'items-start'} sm:max-w-xl`}
                            >
                              <div
                                className={`rounded-[24px] px-4 py-3 shadow-sm ${
                                  isOwn
                                    ? 'rounded-br-md bg-slate-900 text-white'
                                    : 'rounded-bl-md border border-slate-200 bg-white text-slate-800'
                                }`}
                              >
                                <p className="whitespace-pre-wrap break-words text-sm leading-6">
                                  {msg.content}
                                </p>
                              </div>
                              <p
                                className={`mt-2 px-1 text-xs font-medium ${
                                  isOwn ? 'text-slate-400' : 'text-slate-500'
                                }`}
                              >
                                {messageTimeFormatter.format(new Date(msg.createdAt))}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={bottomRef} />
                  </div>
                )}
              </div>

              <div className="border-t border-slate-200 bg-white px-4 py-4 sm:px-6">
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-3 shadow-sm">
                  <textarea
                    value={newMessage}
                    onChange={(event) => setNewMessage(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        void sendMessage();
                      }
                    }}
                    rows={3}
                    maxLength={1000}
                    placeholder={`Message ${activeConversationName}...`}
                    className="min-h-[64px] w-full resize-none border-0 bg-transparent px-2 py-2 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400"
                  />

                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-slate-500">
                      Press Enter to send. Use Shift + Enter for a new line.
                    </p>
                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <span className="text-xs font-medium text-slate-400">
                        {newMessage.trim().length}/1000
                      </span>
                      <button
                        onClick={() => {
                          void sendMessage();
                        }}
                        disabled={sending || !newMessage.trim()}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        <SendHorizontal className="h-4 w-4" />
                        {sending ? 'Sending...' : 'Send message'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full min-h-[720px] flex-col items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.04),_transparent_38%),linear-gradient(to_bottom,_#ffffff,_#f8fafc)] px-6 text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-[32px] bg-slate-900 text-white shadow-sm">
                <MessageSquare className="h-11 w-11" />
              </div>
              <h2 className="mt-6 text-3xl font-semibold tracking-tight text-slate-900">
                Choose a conversation
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-7 text-slate-500">
                Select a thread from your inbox to review updates, respond to new outreach,
                and keep communication moving smoothly.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default function Messages() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-slate-500">Loading messages...</div>}>
      <MessagesContent />
    </Suspense>
  );
}
