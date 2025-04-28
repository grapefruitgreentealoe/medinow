import axiosInstance from '@/lib/axios';
import { CareUnit } from '../../shared/type';

export interface ChatRoom {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  lastReadAt: string | null;
  isActive: boolean;
  user: {
    id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    email: string;
    password: string;
    role: 'user' | 'admin';
    refreshToken: string;
  };
  careUnit: CareUnit;
}

export const getChatRooms = async (): Promise<ChatRoom[]> => {
  const res = await axiosInstance.get('/chats/rooms');
  return res.data;
};
