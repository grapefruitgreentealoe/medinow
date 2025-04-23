import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="p-8 flex justify-center items-center h-[100vh] text-center bg-[#377782]">
      <Image
        alt="404"
        src="/404_image.png"
        className="w-[30vw] min-w-[300px]"
      />
    </div>
  );
}
