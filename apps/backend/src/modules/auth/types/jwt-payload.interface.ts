import { UserRole } from '../../../common/enums/roles.enum';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}
