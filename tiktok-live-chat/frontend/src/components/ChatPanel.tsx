import { useEffect, useRef } from 'react';
import type { ChatMessage } from '../types';

interface Props {
  messages: ChatMessage[];
  highlightedIds: Set<string>;
  onHighlight: (msg: ChatMessage) => void;
}

function Avatar({ src, name }: { src?: string; name: string }) {
  if (src) {
    return <img src={src} alt={name} className="w-8 h-8 rounded-full object-cover shrink-0" />;
  }
  return (
    <div className="w-8 h-8 rounded-full bg-pink-700 flex items-center justify-center text-xs font-bold shrink-0">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export default function ChatPanel({ messages, highlightedIds, onHighlight }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);

  function handleScroll() {
    const el = containerRef.current;
    if (!el) return;
    isAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
  }

  useEffect(() => {
    if (isAtBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2 border-b border-zinc-800 flex items-center gap-2">
        <span className="text-sm font-semibold text-zinc-300">Chat</span>
        <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
          {messages.length}
        </span>
      </div>

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3 py-2 space-y-1"
      >
        {messages.length === 0 && (
          <p className="text-zinc-600 text-sm text-center mt-8">
            เชื่อมต่อ TikTok Live เพื่อดู chat
          </p>
        )}

        {messages.map(msg => {
          const isHighlighted = highlightedIds.has(msg.id);
          return (
            <div
              key={msg.id}
              onClick={() => onHighlight(msg)}
              className={`
                chat-message-enter flex gap-2 items-start px-2 py-1.5 rounded-lg cursor-pointer
                transition-colors group
                ${isHighlighted
                  ? 'bg-pink-950/60 border border-pink-800/50'
                  : 'hover:bg-zinc-800/60 border border-transparent'
                }
              `}
            >
              <Avatar src={msg.profilePicture} name={msg.nickname || msg.username} />
              <div className="min-w-0 flex-1">
                <span className="text-xs font-semibold text-pink-400 mr-1">
                  {msg.nickname || msg.username}
                </span>
                <span className="text-sm text-zinc-200 break-words">{msg.comment}</span>
              </div>
              {!isHighlighted && (
                <span className="text-zinc-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5">
                  📌
                </span>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
