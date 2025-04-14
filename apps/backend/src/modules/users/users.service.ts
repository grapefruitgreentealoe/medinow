import { Injectable, ConflictException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.findUserByEmail(createUserDto.email);

    if (user) {
      throw new ConflictException('이미 존재하는 이메일입니다.');
    }

    const newUser = this.userRepository.create(createUserDto);
    return this.userRepository.save(newUser);
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findUserById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async isExistEmail(email: string): Promise<boolean> {
    const user = await this.findUserByEmail(email);
    return !!user;
  }

  async updateUserRefreshToken(userId: string, refreshToken: string) {
    if (!userId) {
      throw new Error('User ID is required for updating refresh token');
    }
    return await this.userRepository.update({ id: userId }, { refreshToken });
  }

  async deleteUserRefreshToken(userId: string) {
    if (!userId) {
      console.warn('Attempted to delete refresh token with empty userId');
      return;
    }
    return await this.userRepository.update(
      { id: userId },
      { refreshToken: null },
    );
  }
}
