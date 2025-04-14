export type SignupData = {
  email: string;
  password: string;
  managerName: string;
  institutionName: string;
  contact: string;
  address: string;
  businessHourStart: string;
  businessHourEnd: string;
  medicalLicenseNumber: string;
  institutionType: string;
  terms: boolean;
  businessLicense?: File;
};
