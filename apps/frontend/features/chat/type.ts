export interface RoomInfo {
  roomId: string;
  careUnitId: string;
  careUnitName: string;
  lastMessageAt: string | null;
  unreadCount: number;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  roomId: string;
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
