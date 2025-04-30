import { User } from '@/shared/type';

export interface RoomInfo {
  id: string;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string | null;
  unreadCount: number;
  lastReadAt: string | null;
  isActive: boolean;
  user: {
    id: string;
    nickName: string;
  };
  careUnit: {
    id: string;
    name: string;
  };
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  isAdmin: boolean;
  timestamp: string;
  isRead: boolean;
}

export interface RoomMessagesFromServer {
  id: string;
  createdAt: string; // 보낸 시간
  updatedAt: string;
  deletedAt: string | null;
  content: string;
  isRead: boolean;
  sender: {
    id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    email: string;
    password: string;
    role: 'user' | 'admin'; // ❗ 이걸로 user/admin 구분
    refreshToken: string;
  };
}

export interface ChatRoomListProps {
  rooms: RoomInfo[];
  onSelectRoom: (roomId: string) => void;
}

export interface ChatMessagesProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
}

export interface ChatMessage {
  id: string; // 메시지 고유 ID
  content: string; // 메시지 본문
  senderId: string; // 보낸 사람 ID
  senderName: string; // 보낸 사람 이름
  isAdmin: boolean; // 관리자 여부 (true: 병원측, false: 유저)
  roomId: string; // 채팅방 ID
  createdAt: string; // 보낸 시간 (ISO 문자열)
  isRead: boolean; // 읽음 여부
}
