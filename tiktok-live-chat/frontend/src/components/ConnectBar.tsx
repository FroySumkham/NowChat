import { useState } from 'react';
import type { ConnectionStatus } from '../types';

interface Props {
  status: ConnectionStatus;
  onConnect: (username: string) => void;
  onDisconnect: () => void;
}

const STATUS_LABEL: Record<ConnectionStatus, string> = {
  disconnected: 'ไม่ได้เชื่อมต่อ',
  connecting: 'กำลังเชื่อมต่อ...',
  connected: 'เชื่อมต่อแล้ว',
  error: 'เกิดข้อผิดพลาด',
};

const STATUS_COLOR: Record<ConnectionStatus, string> = {
  disconnected: 'bg-gray-500',
  connecting: 'bg-yellow-400',
  connected: 'bg-green-500',
  error: 'bg-red-500',
};

export default function ConnectBar({ status, onConnect, onDisconnect }: Props) {
  const [username, setUsername] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = username.trim().replace('@', '');
    if (!trimmed) return;
    onConnect(trimmed);
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-zinc-900 border-b border-zinc-800">
      {/* TikTok icon */}
      <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.24 8.24 0 004.83 1.56V6.79a4.85 4.85 0 01-1.06-.1z"/>
      </svg>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 flex-1">
        <span className="text-zinc-400 text-sm shrink-0">@</span>
        <input
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="TikTok username"
          disabled={status === 'connecting' || status === 'connected'}
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 disabled:opacity-50"
        />
        {status === 'connected' ? (
          <button
            type="button"
            onClick={onDisconnect}
            className="px-4 py-1.5 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm font-medium transition-colors"
          >
            ยกเลิก
          </button>
        ) : (
          <button
            type="submit"
            disabled={status === 'connecting' || !username.trim()}
            className="px-4 py-1.5 bg-pink-600 hover:bg-pink-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
          >
            เชื่อมต่อ
          </button>
        )}
      </form>

      <div className="flex items-center gap-2 shrink-0">
        <span className={`w-2 h-2 rounded-full ${STATUS_COLOR[status]}`} />
        <span className="text-xs text-zinc-400">{STATUS_LABEL[status]}</span>
      </div>
    </div>
  );
}
