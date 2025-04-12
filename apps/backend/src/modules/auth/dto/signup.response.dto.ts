import { UserRole } from '../../../common/enums/roles.enum';

export class SignupResponseDto {
  message: string;
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
}
