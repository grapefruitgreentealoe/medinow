import { IsString, IsOptional } from 'class-validator';

export class JoinRoomDto {
  @IsString()
  @IsOptional()
  roomId?: string;

  @IsString()
  @IsOptional()
  careUnitId?: string;

  @IsString()
  @IsOptional()
  managerId?: string;
}
