'use client';
import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { databases } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';
import { Send, MessageSquare } from 'lucide-react';
import { Suspense } from 'react';

function MessagesContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvo, setActiveConvo] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const toId = searchParams.get('to');
  const toName = searchParams.get('name');

  useEffect(() => {
    if (user) loadConversations();
  }, [user]);

  useEffect(() => {
    if (toId && toName && user) {
      const convo = { userId: toId, userName: toName };
      setActiveConvo(convo);
      loadMessages(toId);
    }
  }, [toId, toName, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    if (!activeConvo) return;
    const interval = setInterval(() => loadMessages(activeConvo.userId), 3000);
    return () => clearInterval(interval);
  }, [activeConvo]);

  const loadConversations = async () => {
    if (!user) return;
    try {
      const sent = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID!,
        [Query.equal('senderId', user.$id), Query.orderDesc('createdAt'), Query.limit(100)]
      );
      const received = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID!,
        [Query.equal('receiverId', user.$id), Query.orderDesc('createdAt'), Query.limit(100)]
      );

      const allMessages = [...sent.documents, ...received.documents];
      const convoMap = new Map<string, any>();
      allMessages.forEach((msg: any) => {
        const otherId = msg.senderId === user.$id ? msg.receiverId : msg.senderId;
        const otherName = msg.senderId === user.$id ? msg.receiverName : msg.senderName;
        if (!convoMap.has(otherId) || new Date(msg.createdAt) > new Date(convoMap.get(otherId).lastTime)) {
          convoMap.set(otherId, { userId: otherId, userName: otherName, lastMessage: msg.content, lastTime: msg.createdAt });
        }
      });
      setConversations(Array.from(convoMap.values()).sort((a, b) => new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime()));
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const loadMessages = async (otherId: string) => {
    if (!user) return;
    try {
      const sent = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID!,
        [Query.equal('senderId', user.$id), Query.equal('receiverId', otherId), Query.orderAsc('createdAt'), Query.limit(100)]
      );
      const received = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID!,
        [Query.equal('senderId', otherId), Query.equal('receiverId', user.$id), Query.orderAsc('createdAt'), Query.limit(100)]
      );
      const all = [...sent.documents, ...received.documents].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      setMessages(all);

      // Mark received as read
      for (const msg of received.documents) {
        if (!msg.read) {
          await databases.updateDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID!,
            msg.$id,
            { read: true }
          );
        }
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
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
          senderName: user.name,
          receiverId: activeConvo.userId,
          receiverName: activeConvo.userName,
          content: newMessage.trim(),
          read: false,
          createdAt: new Date().toISOString()
        }
      );
      setNewMessage('');
      loadMessages(activeConvo.userId);
      loadConversations();
    } catch (error: any) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  if (!user) return null;

  return (
    <div className="h-[calc(100vh-120px)] flex gap-6">
      {/* Conversations List */}
      <div className="w-80 bg-white rounded-xl border flex flex-col flex-shrink-0">
        <div className="p-4 border-b">
          <h2 className="text-lg font-bold">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No conversations yet</p>
            </div>
          ) : conversations.map(convo => (
            <button
              key={convo.userId}
              onClick={() => { setActiveConvo(convo); loadMessages(convo.userId); }}
              className={`w-full p-4 text-left border-b hover:bg-gray-50 transition-colors ${activeConvo?.userId === convo.userId ? 'bg-primary-50 border-l-4 border-l-primary-600' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  {convo.userName?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{convo.userName}</p>
                  <p className="text-xs text-gray-500 truncate">{convo.lastMessage}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 bg-white rounded-xl border flex flex-col">
        {activeConvo ? (
          <>
            <div className="p-4 border-b flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-full flex items-center justify-center text-white font-bold">
                {activeConvo.userName?.charAt(0).toUpperCase()}
              </div>
              <h3 className="font-semibold">{activeConvo.userName}</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg: any) => (
                <div key={msg.$id} className={`flex ${msg.senderId === user.$id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm ${
                    msg.senderId === user.$id
                      ? 'bg-primary-600 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}>
                    <p>{msg.content}</p>
                    <p className={`text-xs mt-1 ${msg.senderId === user.$id ? 'text-primary-200' : 'text-gray-400'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <div className="p-4 border-t flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Type a message..."
                className="input flex-1"
              />
              <button onClick={sendMessage} disabled={sending || !newMessage.trim()} className="btn btn-primary px-4">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-3 text-gray-300" />
              <p>Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Messages() {
  return (
    <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
      <MessagesContent />
    </Suspense>
  );
}
