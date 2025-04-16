export type SignupData = {
  email: string;
  password: string;
  managerName: string;
  contact: string;
  address: string;
  businessHourStart: string;
  businessHourEnd: string;
  medicalLicenseNumber: string;
  terms: boolean;
  businessLicense?: File;
};

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
