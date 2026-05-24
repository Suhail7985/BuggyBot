'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Plus, MessageSquare, Trash2, Pencil, Check, X,
  PanelLeftClose, Bot, Upload, Settings, LogOut,
} from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { chatService } from '@/services/chatService';
import { authService } from '@/services/authService';
import { ChatSummary } from '@/types';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
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

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

  const groupedChats = {
    today: chats.filter((c) => new Date(c.updatedAt).toDateString() === new Date().toDateString()),
    earlier: chats.filter((c) => new Date(c.updatedAt).toDateString() !== new Date().toDateString()),
  };

  const handleDelete = async (chatId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeletingId(chatId);
    try {
      await chatService.deleteChat(chatId);
      removeChat(chatId);
      if (activeChatId === chatId) router.push('/dashboard');
    } catch { /* ignore */ }
    setDeletingId(null);
  };

  const commitRename = async (chatId: string) => {
    if (!renameValue.trim()) {
      setRenamingId(null);
      return;
    }
    try {
      await chatService.renameChat(chatId, renameValue.trim());
      renameChat(chatId, renameValue.trim());
    } catch { /* ignore */ }
    setRenamingId(null);
  };

  const handleLogout = async () => {
    await authService.logout();
    logout();
    router.push('/');
  };

  const navLink = (href: string, label: string, icon: React.ReactNode) => {
    const active = pathname === href || pathname.startsWith(`${href}/`);
    return (
      <Link
        href={href}
        className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
          active
            ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)]'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
        }`}
      >
        {icon}
        {label}
      </Link>
    );
  };

  return (
    <>
      {sidebarOpen && (
        <div className="sidebar-overlay md:hidden" onClick={() => setSidebarOpen(false)} aria-hidden />
      )}

      <aside
        className={`sidebar sidebar-mobile ${sidebarOpen ? 'open' : ''} md:!translate-x-0`}
      >
        <div className="flex items-center justify-between h-14 px-4 border-b border-[var(--border)] flex-shrink-0">
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <div className="message-avatar assistant w-8 h-8">
              <Bot size={16} />
            </div>
            <span className="font-semibold text-sm truncate">BuggyBot</span>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="btn-ghost btn-icon md:hidden"
            aria-label="Close sidebar"
          >
            <PanelLeftClose size={18} />
          </button>
        </div>

        <div className="p-3 flex-shrink-0">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            id="new-chat-btn"
            className="btn-primary w-full"
          >
            <Plus size={16} />
            New chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-2 min-h-0">
          {chats.length === 0 ? (
            <p className="text-center text-xs text-[var(--text-muted)] py-8 px-3">
              No conversations yet
            </p>
          ) : (
            <div className="space-y-4">
              {groupedChats.today.length > 0 && (
                <ChatGroup
                  label="Today"
                  chats={groupedChats.today}
                  activeChatId={activeChatId}
                  renamingId={renamingId}
                  renameValue={renameValue}
                  deletingId={deletingId}
                  onRenameChange={setRenameValue}
                  onStartRename={(chat, e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setRenamingId(chat._id);
                    setRenameValue(chat.title);
                  }}
                  onCommitRename={commitRename}
                  onCancelRename={() => setRenamingId(null)}
                  onDelete={handleDelete}
                />
              )}
              {groupedChats.earlier.length > 0 && (
                <ChatGroup
                  label="Earlier"
                  chats={groupedChats.earlier}
                  activeChatId={activeChatId}
                  renamingId={renamingId}
                  renameValue={renameValue}
                  deletingId={deletingId}
                  onRenameChange={setRenameValue}
                  onStartRename={(chat, e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setRenamingId(chat._id);
                    setRenameValue(chat.title);
                  }}
                  onCommitRename={commitRename}
                  onCancelRename={() => setRenamingId(null)}
                  onDelete={handleDelete}
                />
              )}
            </div>
          )}
        </div>

        <div className="flex-shrink-0 border-t border-[var(--border)] p-2 space-y-0.5">
          {navLink('/upload', 'Upload', <Upload size={16} />)}
          {navLink('/settings', 'Settings', <Settings size={16} />)}

          <div className="flex items-center gap-2 px-3 py-2.5 mt-1 rounded-md">
            <div className="message-avatar assistant w-8 h-8 text-xs font-semibold">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{user?.name || 'User'}</p>
              <p className="text-[11px] text-[var(--text-muted)] truncate">{user?.email}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="btn-ghost btn-icon text-[var(--text-muted)] hover:text-red-400"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function ChatGroup({
  label,
  chats,
  activeChatId,
  renamingId,
  renameValue,
  deletingId,
  onRenameChange,
  onStartRename,
  onCommitRename,
  onCancelRename,
  onDelete,
}: {
  label: string;
  chats: ChatSummary[];
  activeChatId?: string;
  renamingId: string | null;
  renameValue: string;
  deletingId: string | null;
  onRenameChange: (v: string) => void;
  onStartRename: (chat: ChatSummary, e: React.MouseEvent) => void;
  onCommitRename: (id: string) => void;
  onCancelRename: () => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}) {
  return (
    <div>
      <p className="text-label px-2 mb-1.5">{label}</p>
      <div className="space-y-0.5">
        {chats.map((chat) => (
          <ChatItem
            key={chat._id}
            chat={chat}
            isActive={activeChatId === chat._id}
            isRenaming={renamingId === chat._id}
            renameValue={renameValue}
            onRenameChange={onRenameChange}
            onStartRename={onStartRename}
            onCommitRename={onCommitRename}
            onCancelRename={onCancelRename}
            onDelete={onDelete}
            isDeleting={deletingId === chat._id}
          />
        ))}
      </div>
    </div>
  );
}

function ChatItem({
  chat,
  isActive,
  isRenaming,
  renameValue,
  onRenameChange,
  onStartRename,
  onCommitRename,
  onCancelRename,
  onDelete,
  isDeleting,
}: {
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
}) {
  return (
    <Link
      href={`/chat/${chat._id}`}
      className={`group flex items-center gap-2 px-2.5 py-2 rounded-md text-sm transition-colors ${
        isActive
          ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)]'
          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
      }`}
    >
      <MessageSquare size={14} className="flex-shrink-0 opacity-60" />

      {isRenaming ? (
        <div className="flex-1 flex items-center gap-1 min-w-0" onClick={(e) => e.preventDefault()}>
          <input
            value={renameValue}
            onChange={(e) => onRenameChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onCommitRename(chat._id);
              if (e.key === 'Escape') onCancelRename();
            }}
            className="flex-1 min-w-0 input-field py-1 text-xs"
            autoFocus
          />
          <button type="button" onClick={() => onCommitRename(chat._id)} className="btn-ghost btn-icon">
            <Check size={14} />
          </button>
          <button type="button" onClick={onCancelRename} className="btn-ghost btn-icon">
            <X size={14} />
          </button>
        </div>
      ) : (
        <>
          <span className="flex-1 truncate text-xs font-medium">{chat.title}</span>
          <div className="hidden group-hover:flex items-center gap-0.5 flex-shrink-0">
            <button type="button" onClick={(e) => onStartRename(chat, e)} className="btn-ghost p-1">
              <Pencil size={12} />
            </button>
            <button
              type="button"
              onClick={(e) => onDelete(chat._id, e)}
              disabled={isDeleting}
              className="btn-ghost p-1 hover:text-red-400"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </>
      )}
    </Link>
  );
}
