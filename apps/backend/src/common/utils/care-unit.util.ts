import { CareUnit } from '../../modules/care-units/entities/care-unit.entity';
import { CareUnitCategory } from '../enums/careUnits.enum';

export const parseTime = (
  value: string | number | null | undefined,
): number | undefined => {
  if (!value) return undefined;
  const num = Number(value);
  return isNaN(num) ? undefined : num;
};

export const hasChanges = (existing: any, updated: CareUnit): boolean => {
  const fieldsToCompare = [
    'name',
    'address',
    'tel',
    'lat',
    'lng',
    'mondayOpen',
    'mondayClose',
    'tuesdayOpen',
    'tuesdayClose',
    'wednesdayOpen',
    'wednesdayClose',
    'thursdayOpen',
    'thursdayClose',
    'fridayOpen',
    'fridayClose',
    'saturdayOpen',
    'saturdayClose',
    'sundayOpen',
    'sundayClose',
    'holidayOpen',
    'holidayClose',
    'category',
  ];

  const changedFields = fieldsToCompare.filter((field) => {
    const existingValue = existing[field];
    const updatedValue = updated[field];

    if (existingValue === null || existingValue === undefined) {
      return updatedValue !== null && updatedValue !== undefined;
    }
    if (updatedValue === null || updatedValue === undefined) {
      return existingValue !== null && existingValue !== undefined;
    }

    if (field === 'tel') {
      return String(existingValue) !== String(updatedValue);
    }
    if (typeof existingValue === 'number' && typeof updatedValue === 'number') {
      return existingValue !== updatedValue;
    }
    if (typeof existingValue === 'string' && typeof updatedValue === 'string') {
      return existingValue.trim() !== updatedValue.trim();
    }
    return existingValue !== updatedValue;
  });

  if (changedFields.length > 0) {
    console.log(`📝 변경된 필드 (${updated.hpId}:${updated.category}):`, {
      name: updated.name,
      changedFields: changedFields.map((field) => ({
        field,
        before: existing[field],
        after: updated[field],
      })),
    });
  }

  return changedFields.length > 0;
};

export const createCareUnit = (item: any): CareUnit => {
  if (!item?.hpid) throw new Error('Invalid item: missing hpid');

  return {
    name: item.dutyName || '',
    address: item.dutyAddr || '',
    tel: String(item.dutyTel1 || ''),
    hpId: item.hpid,
    lat: parseFloat(item.wgs84Lat || '0'),
    lng: parseFloat(item.wgs84Lon || '0'),
    mondayOpen: parseTime(item.dutyTime1s),
    mondayClose: parseTime(item.dutyTime1c),
    tuesdayOpen: parseTime(item.dutyTime2s),
    tuesdayClose: parseTime(item.dutyTime2c),
    wednesdayOpen: parseTime(item.dutyTime3s),
    wednesdayClose: parseTime(item.dutyTime3c),
    thursdayOpen: parseTime(item.dutyTime4s),
    thursdayClose: parseTime(item.dutyTime4c),
    fridayOpen: parseTime(item.dutyTime5s),
    fridayClose: parseTime(item.dutyTime5c),
    saturdayOpen: parseTime(item.dutyTime6s),
    saturdayClose: parseTime(item.dutyTime6c),
    sundayOpen: parseTime(item.dutyTime7s),
    sundayClose: parseTime(item.dutyTime7c),
    holidayOpen: parseTime(item.dutyTime8s),
    holidayClose: parseTime(item.dutyTime8c),
    category: item.dutyName.includes('약국')
      ? CareUnitCategory.PHARMACY
      : CareUnitCategory.HOSPITAL,
  } as CareUnit;
};
