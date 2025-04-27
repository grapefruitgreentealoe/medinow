import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  Delete,
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
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public } from '../auth/decorators/public.decorator';
import { RequestUserId } from '../../common/decorators/request-userId.decorator';

@ApiTags('사용자 / 관리자')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiExcludeEndpoint()
  @Post()
  @ApiOperation({ summary: '사용자 등록' })
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({
    description: '사용자 등록 성공!',
    type: User,
  })
  @ApiBadRequestResponse({
    description: '사용자 등록 실패!',
  })
  async createUser(@Body() createUserDto: CreateUserDto) {
    await this.usersService.createUser(createUserDto);
    return {
      message: '사용자 등록 성공',
    };
  }

  @Public()
  @Get('check-email')
  @ApiOperation({ summary: '이메일 중복 확인' })
  @ApiQuery({
    name: 'email',
    type: String,
    description: '이메일',
    required: true,
    example: 'test@test.com',
  })
  @ApiOkResponse({
    description: '이메일 중복 확인 성공',
  })
  @ApiBadRequestResponse({
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
  @ApiOperation({ summary: '사용자 상세 조회' })
  @ApiOkResponse({
    description: '사용자 상세 조회 성공',
  })
  @ApiNotFoundResponse({
    description: '사용자 상세 조회 실패',
  })
  async getUser(@RequestUserId() userId: string) {
    const userInfo = await this.usersService.findUserByIdWithRelations(userId);
    return {
      message: '사용자 상세 조회 성공',
      user: {
        id: userInfo?.id,
        email: userInfo?.email,
        name: userInfo?.userProfile?.name,
        nickname: userInfo?.userProfile?.nickname,
        address: userInfo?.userProfile?.address,
        age: userInfo?.userProfile?.age,
      },
      unitData: 'careUnit' in userInfo ? userInfo.careUnit : null,
    };
  }

  @Patch()
  @ApiOperation({ summary: '사용자 수정' })
  @ApiOkResponse({
    description: '사용자 수정 성공',
  })
  @ApiNotFoundResponse({
    description: '사용자 수정 실패',
  })
  async updateUser(
    @RequestUserId() userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    await this.usersService.updateUser(userId, updateUserDto);
    return {
      message: '사용자 수정 성공',
    };
  }

  @Delete()
  @ApiOperation({ summary: '사용자 삭제' })
  @ApiOkResponse({
    description: '사용자 삭제 성공',
  })
  @ApiNotFoundResponse({
    description: '사용자 삭제 실패',
  })
  async deleteUser(@RequestUserId() userId: string) {
    await this.usersService.deleteUser(userId);
    return {
      message: '사용자 삭제 성공',
    };
  }
}
