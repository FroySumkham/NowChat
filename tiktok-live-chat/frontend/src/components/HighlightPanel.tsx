import type { ChatMessage } from '../types';

interface Props {
  messages: ChatMessage[];
  playingId: string | null;
  onRemove: (id: string) => void;
}

function Avatar({ src, name }: { src?: string; name: string }) {
  if (src) {
    return <img src={src} alt={name} className="w-10 h-10 rounded-full object-cover shrink-0" />;
  }
  return (
    <div className="w-10 h-10 rounded-full bg-pink-700 flex items-center justify-center text-sm font-bold shrink-0">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export default function HighlightPanel({ messages, playingId, onRemove }: Props) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2 border-b border-zinc-800 flex items-center gap-2">
        <span className="text-sm font-semibold text-zinc-300">Highlighted</span>
        <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
          {messages.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {messages.length === 0 && (
          <p className="text-zinc-600 text-sm text-center mt-8">
            คลิกข้อความใน Chat เพื่อ highlight
          </p>
        )}

        {messages.map(msg => {
          const isPlaying = playingId === msg.id;
          return (
            <div
              key={msg.id}
              className={`
                highlight-card relative rounded-xl border p-3 transition-all
                ${isPlaying
                  ? 'bg-pink-950/80 border-pink-600/70 shadow-lg shadow-pink-950/40'
                  : 'bg-zinc-800/80 border-zinc-700/50'
                }
              `}
            >
              {/* Remove button */}
              <button
                onClick={() => onRemove(msg.id)}
                className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors"
                title="เอาออก"
              >
                ✕
              </button>

              <div className="flex gap-3 items-start pr-6">
                <Avatar src={msg.profilePicture} name={msg.nickname || msg.username} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-pink-400">
                      {msg.nickname || msg.username}
                    </span>
                    <span className="text-xs text-zinc-600">@{msg.username}</span>
                  </div>
                  <p className="text-base text-white leading-snug break-words">{msg.comment}</p>
                </div>
              </div>

              {/* TTS status */}
              {isPlaying && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-pink-400">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500" />
                  </span>
                  กำลังพูด...
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
