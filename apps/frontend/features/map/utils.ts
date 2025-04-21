import { CareUnit } from './type';

export const formatTime = (time: number | null) => {
  if (time === null) return '없음';
  const h = Math.floor(time / 100);
  const m = time % 100;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

export const renderTodayTime = (unit: CareUnit) => {
  const day = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ][new Date().getDay()];
  const open = unit[`${day}Open` as keyof CareUnit] as number | null;
  const close = unit[`${day}Close` as keyof CareUnit] as number | null;

  return `${formatTime(open)} ~ ${formatTime(close)}`;
};
