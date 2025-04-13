import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from 'src/common/enums/roles.enum';

export class LoginResponseDto {
  @ApiProperty({ description: '메시지' })
  message: string;

  @ApiProperty({ description: '유저 아이디' })
  id: string;

  @ApiProperty({ description: '이메일' })
  email: string;

  @ApiProperty({ description: '이름' })
  name: string;

  @ApiProperty({ description: '닉네임' })
  nickname: string;

  @ApiProperty({ description: '역할' })
  role: UserRole;

  @ApiProperty({ description: '액세스 토큰' })
  accessToken: string;
}
