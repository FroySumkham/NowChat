import { useEffect, useRef, useState, useCallback } from 'react';
import { socket } from './socket';
import type { ChatMessage, ConnectionStatus } from './types';
import ConnectBar from './components/ConnectBar';
import ChatPanel from './components/ChatPanel';
import HighlightPanel from './components/HighlightPanel';

const MAX_CHAT_MESSAGES = 200;

function speakThai(text: string, onStart: () => void, onEnd: () => void) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'th-TH';
  utter.rate = 1.0;
  utter.pitch = 1.0;
  utter.onstart = onStart;
  utter.onend = onEnd;
  utter.onerror = onEnd;
  window.speechSynthesis.speak(utter);
}

export default function App() {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [highlighted, setHighlighted] = useState<ChatMessage[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Highlighted IDs for quick lookup
  const highlightedIds = new Set(highlighted.map(m => m.id));

  useEffect(() => {
    socket.connect();

    socket.on('connect', () => console.log('[Socket] connected'));
    socket.on('disconnect', () => console.log('[Socket] disconnected'));

    socket.on('tiktok:connected', () => setStatus('connected'));
    socket.on('tiktok:disconnected', () => setStatus('disconnected'));
    socket.on('tiktok:error', ({ message }: { message: string }) => {
      console.error('[TikTok]', message);
      setStatus('error');
    });

    socket.on('chat:message', (msg: ChatMessage) => {
      setMessages(prev => {
        const next = [...prev, msg];
        return next.length > MAX_CHAT_MESSAGES ? next.slice(-MAX_CHAT_MESSAGES) : next;
      });
    });

    // highlight:added broadcast (sync across tabs/clients)
    socket.on('highlight:added', (msg: ChatMessage) => {
      setHighlighted(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
    });

    socket.on('highlight:removed', ({ id }: { id: string }) => {
      setHighlighted(prev => prev.filter(m => m.id !== id));
    });

    // TTS audio received from backend (Gemini TTS — ใช้เมื่อมี API key)
    socket.on('tts:audio', ({ messageId, audioBase64 }: { messageId: string; audioBase64: string }) => {
      const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
      audioRef.current = audio;
      setPlayingId(messageId);
      audio.play().catch(console.error);
      audio.addEventListener('ended', () => setPlayingId(null));
    });

    // Fallback: browser TTS เมื่อ backend ไม่มี API key
    socket.on('tts:fallback', ({ messageId, text }: { messageId: string; text: string }) => {
      speakThai(text, () => setPlayingId(messageId), () => setPlayingId(null));
    });

    return () => {
      socket.off('tiktok:connected');
      socket.off('tiktok:disconnected');
      socket.off('tiktok:error');
      socket.off('chat:message');
      socket.off('highlight:added');
      socket.off('highlight:removed');
      socket.off('tts:audio');
      socket.off('tts:fallback');
      socket.disconnect();
    };
  }, []);

  const handleConnect = useCallback((username: string) => {
    setStatus('connecting');
    setMessages([]);
    socket.emit('tiktok:connect', { username });
  }, []);

  const handleDisconnect = useCallback(() => {
    socket.emit('tiktok:disconnect');
    setStatus('disconnected');
  }, []);

  const handleHighlight = useCallback((msg: ChatMessage) => {
    if (highlightedIds.has(msg.id)) return;
    socket.emit('highlight:add', msg);
  }, [highlightedIds]);

  const handleRemoveHighlight = useCallback((id: string) => {
    socket.emit('highlight:remove', { id });
  }, []);

  return (
    <div className="flex flex-col h-screen bg-zinc-950">
      <ConnectBar
        status={status}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Chat stream — left */}
        <div className="w-1/2 border-r border-zinc-800 overflow-hidden flex flex-col">
          <ChatPanel
            messages={messages}
            highlightedIds={highlightedIds}
            onHighlight={handleHighlight}
          />
        </div>

        {/* Highlighted panel — right */}
        <div className="w-1/2 overflow-hidden flex flex-col">
          <HighlightPanel
            messages={highlighted}
            playingId={playingId}
            onRemove={handleRemoveHighlight}
          />
        </div>
      </div>
    </div>
  );
}
