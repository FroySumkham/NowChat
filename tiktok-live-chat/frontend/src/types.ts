export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  nickname: string;
  comment: string;
  profilePicture?: string;
  timestamp: number;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
