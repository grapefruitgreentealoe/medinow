'use client';

import { ChatLayout } from '@/features/chat/ui/ChatLayout';
import { ChatRoomList } from '@/features/chat/ui/ChatRoomList';
import { ChatMessages } from '@/features/chat/ui/ChatMessages';
import { HospitalInfoCard } from '@/features/chat/ui/HospitalInfoCard';
import { useState, useEffect } from 'react';
import { socket } from '@/lib/socket';
import { useSearchParams } from 'next/navigation';
import axiosInstance from '@/lib/axios'; // 🚨 axios 세팅된 인스턴스 필요해!
import { RoomInfo } from '@/features/chat/type';

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  roomId: string;
}

export default function ChatPage() {
  const searchParams = useSearchParams();
  const careUnitId = searchParams.get('id');

  const [roomList, setRoomList] = useState<RoomInfo[]>([]);
  const [messagesMap, setMessagesMap] = useState<Map<string, Message[]>>(
    new Map()
  );
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [input, setInput] = useState('');

  useEffect(() => {
    if (!careUnitId) return;

    socket.connect();

    const fetchRoomsAndJoin = async () => {
      try {
        const res = await axiosInstance.get('/chats/rooms');

        // ✅ 여기서 변환
        const parsedRooms: RoomInfo[] = res.data.map((room: any) => ({
          roomId: room.id,
          careUnitId: room.careUnit.id,
          careUnitName: room.careUnit.name,
          lastMessageAt: room.lastMessageAt,
          unreadCount: room.unreadCount,
        }));

        setRoomList(parsedRooms);

        const matchedRoom = parsedRooms.find(
          (r) => r.careUnitId === careUnitId
        );

        if (matchedRoom) {
          socket.emit('joinRoom', { roomId: matchedRoom.roomId });
          setCurrentRoomId(matchedRoom.roomId);
        } else {
          socket.emit('joinRoom', { careUnitId });
        }
      } catch (err) {
        console.error('채팅방 목록 가져오기 실패', err);
      }
    };

    fetchRoomsAndJoin();

    socket.on('roomMessages', (messages: Message[]) => {
      if (!messages.length) return;

      const roomId = messages[0].roomId;
      const matchedRoom = roomList.find((r) => r.careUnitId === careUnitId);
      const careUnitName = matchedRoom?.careUnitName || '병원 이름 없음';

      // 새로 추가
      setRoomList((prev) => {
        const alreadyExists = prev.some((r) => r.roomId === roomId);
        if (alreadyExists) return prev;
        return [
          ...prev,
          {
            roomId,
            careUnitId,
            careUnitName,
            lastMessageAt: new Date().toISOString(),
            unreadCount: 0,
          } as RoomInfo,
        ];
      });

      // 메시지도 세팅
      setMessagesMap((prev) => new Map(prev).set(roomId, messages));

      // 현재 방 세팅
      setCurrentRoomId(roomId);
    });

    socket.on('newMessage', (message: Message) => {
      setMessagesMap((prev) => {
        const newMap = new Map(prev);
        const existing = newMap.get(message.roomId) || [];

        // ✨ temp- 로 시작하는 optimistic 메시지는 제거
        const withoutTemp = existing.filter(
          (msg) => !msg.id.startsWith('temp-')
        );

        newMap.set(message.roomId, [...withoutTemp, message]);
        return newMap;
      });
    });

    return () => {
      socket.disconnect();
      socket.off('roomMessages');
      socket.off('newMessage');
    };
  }, [careUnitId]);

  const handleSendMessage = () => {
    if (!input.trim() || !currentRoomId) return;

    const tempMessage = {
      id: `temp-${Date.now()}`,
      content: input.trim(),
      senderId: 'me',
      roomId: currentRoomId,
      createdAt: new Date().toISOString(),
    };

    setMessagesMap((prev) => {
      const newMap = new Map(prev);
      const existingMessages = newMap.get(currentRoomId) || [];
      newMap.set(currentRoomId, [...existingMessages, tempMessage]);
      return newMap;
    });

    socket.emit('sendMessage', {
      roomId: currentRoomId,
      content: input.trim(),
    });
    setInput('');
  };

  return (
    <ChatLayout
      left={<ChatRoomList rooms={roomList} onSelectRoom={setCurrentRoomId} />}
      center={
        <ChatMessages
          messages={messagesMap.get(currentRoomId!) || []}
          onSendMessage={handleSendMessage}
          input={input}
          setInput={setInput}
        />
      }
      right={<HospitalInfoCard />}
    />
  );
}
