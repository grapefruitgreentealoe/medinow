import {
  Controller,
  Post,
  Body,
  HttpStatus,
  Get,
  Query,
  UseGuards,
  Delete,
  Param,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import {
  ApiOperation,
  ApiQuery,
  ApiBody,
  ApiResponse,
  ApiTags,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('사용자 / 관리자')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiCookieAuth()
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
    if (isExist) {
      return {
        message: '이미 존재하는 이메일입니다.',
        isDuplicate: true,
      };
    }
    return {
      message: '사용 가능한 이메일입니다.',
      isDuplicate: false,
    };
  }

  @Get()
  @ApiCookieAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '사용자 목록 조회' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '사용자 목록 조회 성공',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '사용자 목록 조회 실패',
  })
  async getUsers() {
    const users = await this.usersService.findUsers();
    return {
      message: '사용자 목록 조회 성공',
      users,
    };
  }

  @Get(':userId')
  @ApiCookieAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '사용자 상세 조회' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '사용자 상세 조회 성공',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '사용자 상세 조회 실패',
  })
  async getUser(@Param('userId') userId: string) {
    const user = await this.usersService.findUserById(userId);
    return {
      message: '사용자 상세 조회 성공',
      user,
    };
  }

  @Patch(':userId')
  @ApiCookieAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '사용자 수정' })
  async updateUser(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    await this.usersService.updateUser(userId, updateUserDto);
    return {
      message: '사용자 수정 성공',
    };
  }

  @Delete(':userId')
  @ApiCookieAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '사용자 삭제' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '사용자 삭제 성공',
  })
  async deleteUser(@Param('userId') userId: string) {
    await this.usersService.deleteUser(userId);
    return {
      message: '사용자 삭제 성공',
    };
  }
}
