import { useEffect, useState } from 'react';
import { socket } from './socket';
import type { ChatMessage } from './types';

function speakThai(text: string, onStart: () => void, onEnd: () => void) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'th-TH';
  utter.rate = 1.0;
  utter.onstart = onStart;
  utter.onend = onEnd;
  utter.onerror = onEnd;
  window.speechSynthesis.speak(utter);
}

export default function Overlay() {
  const [highlighted, setHighlighted] = useState<ChatMessage[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    socket.connect();

    socket.on('highlight:added', (msg: ChatMessage) => {
      setHighlighted(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
    });

    socket.on('highlight:removed', ({ id }: { id: string }) => {
      setHighlighted(prev => prev.filter(m => m.id !== id));
    });

    socket.on('tts:audio', ({ messageId, audioBase64 }: { messageId: string; audioBase64: string }) => {
      const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
      setPlayingId(messageId);
      audio.play().catch(console.error);
      audio.addEventListener('ended', () => setPlayingId(null));
    });

    socket.on('tts:fallback', ({ messageId, text }: { messageId: string; text: string }) => {
      speakThai(text, () => setPlayingId(messageId), () => setPlayingId(null));
    });

    return () => {
      socket.off('highlight:added');
      socket.off('highlight:removed');
      socket.off('tts:audio');
      socket.off('tts:fallback');
      socket.disconnect();
    };
  }, []);

  if (highlighted.length === 0) return null;

  return (
    <div className="p-4 space-y-3 w-full">
      {highlighted.map(msg => {
        const isPlaying = playingId === msg.id;
        return (
          <div
            key={msg.id}
            className={`
              rounded-2xl px-4 py-3 flex gap-3 items-start
              border transition-all duration-300
              ${isPlaying
                ? 'bg-black/80 border-pink-500/80 shadow-lg shadow-pink-950/50'
                : 'bg-black/70 border-white/10'
              }
            `}
            style={{ backdropFilter: 'blur(8px)' }}
          >
            {/* Avatar */}
            {msg.profilePicture ? (
              <img src={msg.profilePicture} alt={msg.nickname} className="w-10 h-10 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-pink-700 flex items-center justify-center text-sm font-bold shrink-0">
                {(msg.nickname || msg.username).charAt(0).toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-bold text-pink-400 leading-none">
                  {msg.nickname || msg.username}
                </span>
                {isPlaying && (
                  <span className="flex gap-0.5 items-end h-3">
                    {[0, 0.15, 0.3].map(delay => (
                      <span
                        key={delay}
                        className="w-0.5 bg-pink-400 rounded-full animate-bounce"
                        style={{ height: '10px', animationDelay: `${delay}s` }}
                      />
                    ))}
                  </span>
                )}
              </div>
              <p className="text-white text-base font-medium leading-snug break-words">
                {msg.comment}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
