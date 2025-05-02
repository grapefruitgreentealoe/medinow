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

  careUnitName: string;
  careUnitAddress: string;
  careUnitCategory: string;
  // imageUrl?: string;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
  nickname: string;
  address: string;
  age: number;
}
