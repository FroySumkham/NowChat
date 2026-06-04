import { WebcastPushConnection } from 'tiktok-live-connector';

let connection = null;

export function connectTikTok(username, io) {
  if (connection) {
    connection.disconnect();
    connection = null;
  }

  connection = new WebcastPushConnection(username, {
    processInitialData: false,
    enableExtendedGiftInfo: false,
    enableWebsocketUpgrade: true,
    requestPollingIntervalMs: 2000,
    clientParams: {
      app_language: 'th-TH',
      device_platform: 'web',
    },
  });

  connection.connect()
    .then(state => {
      console.log(`[TikTok] Connected to @${username} | Room ID: ${state.roomId}`);
      io.emit('tiktok:connected', { username, roomId: state.roomId });
    })
    .catch(err => {
      console.error('[TikTok] Connection error:', err.message);
      io.emit('tiktok:error', { message: err.message });
    });

  connection.on('chat', data => {
    const message = {
      id: `${data.userId}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      userId: data.userId,
      username: data.uniqueId,
      nickname: data.nickname,
      comment: data.comment,
      profilePicture: data.profilePictureUrl,
      timestamp: Date.now(),
    };
    io.emit('chat:message', message);
  });

  connection.on('disconnected', () => {
    console.log('[TikTok] Disconnected');
    io.emit('tiktok:disconnected', {});
  });

  connection.on('error', err => {
    console.error('[TikTok] Error:', err.message);
    io.emit('tiktok:error', { message: err.message });
  });

  return connection;
}

export function disconnectTikTok(io) {
  if (connection) {
    connection.disconnect();
    connection = null;
    io.emit('tiktok:disconnected', {});
  }
}
