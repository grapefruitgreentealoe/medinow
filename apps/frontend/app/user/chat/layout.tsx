'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { socket } from '@/lib/socket';
import { ChatRoomList } from '@/features/chat/ui/ChatRoomList';
import { HospitalInfoCard } from '@/features/chat/ui/HospitalInfoCard';
import { ChatMessages } from '@/features/chat/ui/ChatMessages';
import { RoomInfo, Message } from '@/features/chat/type';
import axiosInstance from '@/lib/axios';

interface ChatLayoutProps {
  children?: React.ReactNode;
}

export default function ChatLayout({ children }: ChatLayoutProps) {
  const [roomList, setRoomList] = useState<RoomInfo[]>([]);
  const [messagesMap, setMessagesMap] = useState<Map<string, Message[]>>(
    new Map()
  );
  const [input, setInput] = useState('');
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const careUnitId = searchParams.get('id');
  const router = useRouter();

  useEffect(() => {
    //연결확인?
    socket.connect();
    socket.on('connect', () => {
      console.log('✅ Socket connected!', socket.id);
    });

    //연결 해제시
    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    // 처음 방 리스트 가져오기
    const fetchRooms = async () => {
      try {
        const res = await axiosInstance.get('/chats/rooms');

        const parsedRooms: RoomInfo[] = res.data.map((room: any) => ({
          roomId: room.id,
          careUnitId: room.careUnit.id,
          careUnitName: room.careUnit.name,
          lastMessageAt: room.lastMessageAt,
          unreadCount: room.unreadCount,
        }));

        //방 목록
        setRoomList(parsedRooms);
      } catch (error) {
        console.error('방 목록 불러오기 실패', error);
      }
    };

    fetchRooms();

    return () => {
      socket.disconnect();
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  //일단 채팅 레이아웃에 접근해서 처음접근한거면 careUnitId로 joinRoom
  // 이전에 채팅방이 있으면, roomId매핑 후 현재 roomId로 접근

  useEffect(() => {
    const matchedRoom = roomList.find((r) => r.careUnitId === careUnitId);

    if (matchedRoom) {
      // 기존 방이 있으면
      socket.emit('joinRoom', { roomId: matchedRoom.roomId });
      setCurrentRoomId(matchedRoom.roomId);
    } else {
      // 없으면 새로 방 생성
      socket.emit('joinRoom', { careUnitId });
      socket.on(
        'roomCreated',
        (object: { roomId: string; careUnitId: string }) => {
          if (!object) {
            console.log('not created');
            return;
          }
          const roomId = object.roomId;
          setCurrentRoomId(roomId); //roomId를 roomMessage를 통해 받는다.
        }
      );
    }

    //채팅방 입장 시 이전 메시지 목록
    socket.on('roomMessages', (messages: Message[]) => {
      if (!messages.length) return;
      const roomId = messages[0].roomId; // 항상 roomId를 받는다.
      setMessagesMap((prev) => new Map(prev).set(roomId, messages)); //받아온 메시지를 맵객체에 넣는다.
      setCurrentRoomId(roomId); //roomId를 roomMessage를 통해 받는다.
    });

    //새로운 메시지 수신
    socket.on('newMessage', (message: Message) => {
      setMessagesMap((prev) => {
        const newMap = new Map(prev);
        const existing = newMap.get(message.roomId) || [];
        newMap.set(message.roomId, [...existing, message]);
        return newMap;
      });
    });

    return () => {
      socket.off('roomMessages');
      socket.off('joinRoom');
      socket.off('newMessage');
    };
  }, [careUnitId, roomList]);


  //룸아이디를 선택 시, 룸 아이디로 접근
  const handleSelectRoom = (roomId: string) => {
    router.push(`/user/chat?roomId=${roomId}`);
  };

  //메시지 보낼떄
  const handleSendMessage = () => {
    if (!input.trim() || !currentRoomId) return;

    const tempMessage = {
      id: `temp-${Date.now()}`,
      senderId: 'me',
      content: input,
      createdAt: new Date().toISOString(),
      roomId: currentRoomId,
    };

    setMessagesMap((prev) => {
      const newMap = new Map(prev);
      const existing = newMap.get(currentRoomId) || [];
      newMap.set(currentRoomId, [...existing, tempMessage]);
      return newMap;
    });

    socket.emit('sendMessage', {
      roomId: currentRoomId,
      content: input,
    });

    setInput('');
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/4 border-r overflow-y-auto">
        <ChatRoomList rooms={roomList} onSelectRoom={handleSelectRoom} />
      </div>
      <div className="w-2/4 flex flex-col">
        <ChatMessages
          messages={messagesMap.get(currentRoomId!) || []}
          input={input}
          setInput={setInput}
          onSendMessage={handleSendMessage}
        />
      </div>
      <div className="w-1/4 border-l overflow-y-auto">
        <HospitalInfoCard />
      </div>
    </div>
  );
}
