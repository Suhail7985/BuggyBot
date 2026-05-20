'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
// framer-motion used via motion.div inside child components
import {
  Plus, MessageSquare, Trash2, Pencil, Check, X,
  ChevronLeft, Bot, Upload, Settings, LogOut
} from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { chatService } from '@/services/chatService';
import { authService } from '@/services/authService';
import { ChatSummary } from '@/types';

export default function Sidebar() {
  const router = useRouter();
  const params = useParams();
  const activeChatId = params?.id as string | undefined;

  const { chats, setChats, removeChat, renameChat, sidebarOpen, setSidebarOpen } = useChatStore();
  const { user, logout } = useAuthStore();

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    chatService.getChatHistory().then(setChats).catch(() => {});
  }, [setChats]);

  const handleNewChat = () => {
    router.push('/dashboard');
  };

  const handleDelete = async (chatId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeletingId(chatId);
    try {
      await chatService.deleteChat(chatId);
      removeChat(chatId);
      if (activeChatId === chatId) router.push('/dashboard');
    } catch {}
    setDeletingId(null);
  };

  const startRename = (chat: ChatSummary, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setRenamingId(chat._id);
    setRenameValue(chat.title);
  };

  const commitRename = async (chatId: string) => {
    if (!renameValue.trim()) { setRenamingId(null); return; }
    try {
      await chatService.renameChat(chatId, renameValue.trim());
      renameChat(chatId, renameValue.trim());
    } catch {}
    setRenamingId(null);
  };

  const handleLogout = async () => {
    await authService.logout();
    logout();
    router.push('/');
  };

  const groupedChats = {
    today: chats.filter(c => {
      const d = new Date(c.updatedAt);
      const now = new Date();
      return d.toDateString() === now.toDateString();
    }),
    earlier: chats.filter(c => {
      const d = new Date(c.updatedAt);
      const now = new Date();
      return d.toDateString() !== now.toDateString();
    }),
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar fixed md:relative z-40 transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-white/10 flex items-center justify-center text-blue-300">
              <Bot size={14} />
            </div>
            <span className="font-bold text-sm">BuggyBot</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="btn-ghost p-1.5 md:hidden"
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={handleNewChat}
            id="new-chat-btn"
            className="btn-primary w-full py-2.5 text-sm"
          >
            <Plus size={16} /> New Chat
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {chats.length === 0 ? (
            <div className="text-center py-8 text-[var(--text-muted)] text-xs">
              <MessageSquare size={24} className="mx-auto mb-2 opacity-30" />
              No chats yet. Start a new conversation!
            </div>
          ) : (
            <>
              {groupedChats.today.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-[var(--text-muted)] px-2 py-1 font-medium uppercase tracking-wider">Today</p>
                  {groupedChats.today.map((chat) => (
                    <ChatItem
                      key={chat._id}
                      chat={chat}
                      isActive={activeChatId === chat._id}
                      isRenaming={renamingId === chat._id}
                      renameValue={renameValue}
                      onRenameChange={setRenameValue}
                      onStartRename={startRename}
                      onCommitRename={commitRename}
                      onCancelRename={() => setRenamingId(null)}
                      onDelete={handleDelete}
                      isDeleting={deletingId === chat._id}
                    />
                  ))}
                </div>
              )}
              {groupedChats.earlier.length > 0 && (
                <div>
                  <p className="text-xs text-[var(--text-muted)] px-2 py-1 font-medium uppercase tracking-wider">Earlier</p>
                  {groupedChats.earlier.map((chat) => (
                    <ChatItem
                      key={chat._id}
                      chat={chat}
                      isActive={activeChatId === chat._id}
                      isRenaming={renamingId === chat._id}
                      renameValue={renameValue}
                      onRenameChange={setRenameValue}
                      onStartRename={startRename}
                      onCommitRename={commitRename}
                      onCancelRename={() => setRenamingId(null)}
                      onDelete={handleDelete}
                      isDeleting={deletingId === chat._id}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom Nav */}
        <div className="border-t border-white/5 p-3 space-y-1">
          <Link href="/upload" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[var(--text-secondary)] hover:text-white hover:bg-white/5 transition-all text-sm">
            <Upload size={15} />Upload Book
          </Link>
          <Link href="/settings" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[var(--text-secondary)] hover:text-white hover:bg-white/5 transition-all text-sm">
            <Settings size={15} />Settings
          </Link>

          {/* User */}
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg mt-2 border-t border-white/5 pt-3">
            <div className="w-7 h-7 rounded-full bg-blue-500/10 border border-white/10 flex items-center justify-center text-xs font-bold text-blue-300 flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-[var(--text-muted)] truncate">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="btn-ghost p-1 text-[var(--text-muted)] hover:text-red-400" title="Logout">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

interface ChatItemProps {
  chat: ChatSummary;
  isActive: boolean;
  isRenaming: boolean;
  renameValue: string;
  onRenameChange: (v: string) => void;
  onStartRename: (chat: ChatSummary, e: React.MouseEvent) => void;
  onCommitRename: (id: string) => void;
  onCancelRename: () => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  isDeleting: boolean;
}

function ChatItem({
  chat, isActive, isRenaming, renameValue, onRenameChange,
  onStartRename, onCommitRename, onCancelRename, onDelete, isDeleting
}: ChatItemProps) {
  return (
    <Link
      href={`/chat/${chat._id}`}
      className={`group flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all mb-0.5 ${
        isActive
          ? 'bg-blue-500/10 border border-blue-500/20 text-white'
          : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-white'
      }`}
    >
      <MessageSquare size={13} className="flex-shrink-0 opacity-60" />

      {isRenaming ? (
        <div className="flex-1 flex items-center gap-1" onClick={(e) => e.preventDefault()}>
          <input
            value={renameValue}
            onChange={(e) => onRenameChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onCommitRename(chat._id);
              if (e.key === 'Escape') onCancelRename();
            }}
            className="flex-1 bg-transparent border border-blue-500/40 rounded px-1.5 py-0.5 text-xs outline-none"
            autoFocus
          />
          <button onClick={() => onCommitRename(chat._id)} className="text-green-400 hover:text-green-300">
            <Check size={12} />
          </button>
          <button onClick={onCancelRename} className="text-red-400 hover:text-red-300">
            <X size={12} />
          </button>
        </div>
      ) : (
        <>
          <span className="flex-1 truncate text-xs">{chat.title}</span>
          <div className="hidden group-hover:flex items-center gap-1 flex-shrink-0">
            <button
              onClick={(e) => onStartRename(chat, e)}
              className="text-[var(--text-muted)] hover:text-white p-0.5"
            >
              <Pencil size={11} />
            </button>
            <button
              onClick={(e) => onDelete(chat._id, e)}
              disabled={isDeleting}
              className="text-[var(--text-muted)] hover:text-red-400 p-0.5"
            >
              <Trash2 size={11} />
            </button>
          </div>
        </>
      )}
    </Link>
  );
}
