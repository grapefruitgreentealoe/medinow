import axiosInstance from '@/shared/lib/axios';
import { CareUnit } from '../map/type';

export interface ChatRoom {
  id: string;
  target: CareUnit;
  createdAt: string;
  updatedAt: string;
}

export const getChatRooms = async (): Promise<ChatRoom[]> => {
  const res = await axiosInstance.get('/chats/rooms');
  return res.data;
};
