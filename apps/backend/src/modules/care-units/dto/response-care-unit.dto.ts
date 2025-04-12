export class ResponseCareUnitDto {
  name: string;
  address: string;
  tel: string;
  hpid: string;
  lat: number;
  lng: number;
  mondayOpen: string;
  mondayClose: string;
  tuesdayOpen: string;
  tuesdayClose: string;
  wednesdayOpen: string;
  wednesdayClose: string;
  thursdayOpen: string;
  thursdayClose: string;
  fridayOpen: string;
  fridayClose: string;
  saturdayOpen: string;
  saturdayClose: string;
  sundayOpen: string;
  sundayClose: string;
  holidayOpen: string;
  holidayClose: string;
  is_badged: boolean;
  now_open: boolean;
  kakao_url: string | null;
}
