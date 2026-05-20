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
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar fixed md:relative z-40 transition-transform duration-300 bg-[var(--bg-secondary)] border-r border-white/5 flex flex-col h-screen overflow-hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        {/* Header */}
        <div className="p-4.5 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform duration-200">
              <Bot size={15} className="text-white" />
            </div>
            <span className="font-black text-sm tracking-tight text-white group-hover:text-blue-400 transition-colors">BuggyBot</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="btn-ghost p-1.5 md:hidden"
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={handleNewChat}
            id="new-chat-btn"
            className="btn-primary w-full py-2.5 text-sm shadow-md hover:shadow-blue-500/10 font-semibold"
          >
            <Plus size={16} className="stroke-[3]" /> New Chat
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto px-3 pb-2 space-y-4">
          {chats.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-muted)] text-xs">
              <MessageSquare size={20} className="mx-auto mb-2.5 opacity-20" />
              No chats yet. Start a new conversation!
            </div>
          ) : (
            <>
              {groupedChats.today.length > 0 && (
                <div>
                  <p className="text-[10px] text-[var(--text-muted)] px-3 py-1.5 font-bold uppercase tracking-widest bg-white/[0.01] rounded-md mb-1.5">Today</p>
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
                  <p className="text-[10px] text-[var(--text-muted)] px-3 py-1.5 font-bold uppercase tracking-widest bg-white/[0.01] rounded-md mb-1.5">Earlier</p>
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
        <div className="border-t border-white/5 p-3 space-y-1 bg-white/[0.005]">
          <Link href="/upload" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[var(--text-secondary)] hover:text-white hover:bg-white/5 transition-all text-xs font-semibold">
            <Upload size={14} className="opacity-70" />Upload Book
          </Link>
          <Link href="/settings" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[var(--text-secondary)] hover:text-white hover:bg-white/5 transition-all text-xs font-semibold">
            <Settings size={14} className="opacity-70" />Settings
          </Link>

          {/* User */}
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mt-2 border-t border-white/5 pt-3.5 bg-white/[0.01]">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-600/20 border border-blue-500/20 flex items-center justify-center text-xs font-black text-blue-400 flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate text-white leading-none mb-0.5">{user?.name || 'User'}</p>
              <p className="text-[10px] text-[var(--text-secondary)] truncate leading-none">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="btn-ghost p-1.5 text-[var(--text-muted)] hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all" title="Logout">
              <LogOut size={13} />
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
      className={`group flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all mb-1 border ${
        isActive
          ? 'bg-blue-500/10 border-blue-500/25 text-white shadow-sm shadow-blue-500/5'
          : 'border-transparent text-[var(--text-secondary)] hover:bg-white/5 hover:text-white'
      }`}
    >
      <MessageSquare size={13} className={`flex-shrink-0 ${isActive ? 'text-blue-400 opacity-100' : 'opacity-50 group-hover:opacity-85'}`} />

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
          <span className="flex-1 truncate">{chat.title}</span>
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
