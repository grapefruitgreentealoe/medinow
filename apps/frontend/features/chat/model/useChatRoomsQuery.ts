import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios'; // 너가 쓰는 axios 래퍼

export interface ChatRoom {
  id: string;
  name: string;
  lastMessage: string;
  unreadCount: number;
}

export function useChatRoomsQuery() {
  return useQuery<ChatRoom[]>({
    queryKey: ['chatRooms'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/chats/rooms');
      return data;
    },
    staleTime: 60 * 1000, // 1분 정도 캐싱
  });
}
