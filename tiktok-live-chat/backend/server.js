import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { connectTikTok, disconnectTikTok } from './tiktok.js';
import { synthesizeSpeech } from './tts.js';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',  // รองรับทั้ง localhost และ IP อื่นในเครือข่าย
    methods: ['GET', 'POST'],
  },
});

app.use(cors({ origin: '*' }));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => res.json({ ok: true }));

io.on('connection', socket => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  // Host connects to TikTok Live
  socket.on('tiktok:connect', ({ username }) => {
    if (!username) return;
    console.log(`[TikTok] Connecting to @${username}...`);
    connectTikTok(username.replace('@', ''), io);
  });

  // Host disconnects from TikTok Live
  socket.on('tiktok:disconnect', () => {
    disconnectTikTok(io);
  });

  // Host highlights a message — trigger TTS
  socket.on('highlight:add', async (message) => {
    io.emit('highlight:added', message);

    // Call TTS — ถ้ามี API key ใช้ Gemini TTS, ถ้าไม่มีให้ browser ทำแทน
    const audioBase64 = await synthesizeSpeech(message.comment);
    if (audioBase64) {
      io.emit('tts:audio', { messageId: message.id, audioBase64 });
    } else {
      io.emit('tts:fallback', { messageId: message.id, text: message.comment });
    }
  });

  // Host removes a highlighted message
  socket.on('highlight:remove', ({ id }) => {
    io.emit('highlight:removed', { id });
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
  console.log(`[TTS] ${process.env.GOOGLE_API_KEY || process.env.GOOGLE_APPLICATION_CREDENTIALS ? 'ENABLED' : 'DISABLED (no credentials)'}`);
});
