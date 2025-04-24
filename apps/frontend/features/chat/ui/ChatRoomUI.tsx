import { CareUnit } from '@/shared/type';

interface ChatRoomUIProps {
  careUnit: CareUnit;
}

export const ChatRoomUI = ({ careUnit }: ChatRoomUIProps) => {
  return (
    <div className="flex flex-col h-full">
      <h2 className="text-lg font-semibold mb-2">{careUnit.name}와의 채팅</h2>
      <div className="flex-1 overflow-y-auto bg-gray-50 p-2 rounded-md">
        {/* 메시지 리스트 */}
      </div>
      <div className="flex gap-2 mt-2">
        <input
          className="flex-1 border px-2 py-1 rounded"
          placeholder="메시지를 입력하세요"
        />
        <button className="px-4 py-1 bg-blue-500 text-white rounded">
          전송
        </button>
      </div>
    </div>
  );
};
