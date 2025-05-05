import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';

export interface Message {
  id: string;
  sender: string;
  content: string;
  createdAt: string;
}

export function useMessagesQuery(roomId: string) {
  return useQuery<Message[]>({
    queryKey: ['messages', roomId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `/chats/rooms/${roomId}/messages`
      );
      return data;
    },
    enabled: !!roomId, // roomId 있을 때만 호출
    staleTime: 60 * 1000,
  });
}
