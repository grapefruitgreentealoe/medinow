export const useRenderTimeRow = (
  label: string,
  open: number | null,
  close: number | null
) => (
  <>
    <div className="text-muted-foreground">{label}</div>
    <div>
      {timeToStr(open)} - {timeToStr(close)}
    </div>
  </>
);

const timeToStr = (time: number | null) => {
  if (time === 0) return '00:00';
  if (!time) return '휴무';
  const h = String(Math.floor(time / 100)).padStart(2, '0');
  const m = String(time % 100).padStart(2, '0');
  return `${h}:${m}`;
};
