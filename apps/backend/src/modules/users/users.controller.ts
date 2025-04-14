import {
  Controller,
  Post,
  Body,
  HttpStatus,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import {
  ApiOperation,
  ApiQuery,
  ApiBody,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('사용자 / 관리자')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: '사용자 등록' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '사용자 등록 성공',
    type: User,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '사용자 등록 실패',
  })
  async createUser(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.createUser(createUserDto);
    return {
      message: '사용자 등록 성공',
      user,
    };
  }

  @Get('check-email')
  @ApiOperation({ summary: '이메일 중복 확인' })
  @ApiQuery({
    name: 'email',
    type: String,
    description: '이메일',
    required: true,
    example: 'test@test.com',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '이메일 중복 확인 성공',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '이메일 중복 확인 실패',
  })
  async checkEmail(@Query('email') email: string) {
    const isExist = await this.usersService.isExistEmail(email);
    return {
      email,
      isDuplicate: isExist,
    };
  }
}
