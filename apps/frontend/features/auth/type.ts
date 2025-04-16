export interface SignupData {
  email: string;
  password: string;
  name: string;
  nickname: string;
  address: string;
  age: number;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AdminSignupData {
  email: string;
  password: string;
  name: string;
  nickname: string;
  address?: string;
  age?: number;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
  nickname: string;
  address: string;
  age: number;
}

export interface CareUnitData {
  name: string;
  address: string;
  tel: string;
  hpid: string;
  lat: 0;
  lng: 0;
  monday: {
    open: string;
    close: string;
  };
  tuesday: {
    open: string;
    close: string;
  };
  wednesday: {
    open: string;
    close: string;
  };
  thursday: {
    open: string;
    close: string;
  };
  friday: {
    open: string;
    close: string;
  };
  saturday: {
    open: string;
    close: string;
  };
  sunday: {
    open: string;
    close: string;
  };
  holiday: {
    open: string;
    close: string;
  };
}
