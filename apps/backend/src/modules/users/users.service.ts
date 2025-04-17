import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserProfile } from './entities/user-profile.entity';
import { ImagesService } from '../images/images.service';
import { UserRole } from '../../common/enums/roles.enum';
import { CareUnitService } from '../care-units/services/care-unit.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
    private readonly imagesService: ImagesService,
    private readonly careUnitService: CareUnitService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.findUserByEmail(createUserDto.email);

    if (user) {
      throw new ConflictException('이미 존재하는 이메일입니다.');
    }

    const { email, password, ...userProfile } = createUserDto;

    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newUser = this.userRepository.create({
        email,
        password,
      });
      const savedUser = await queryRunner.manager.save(newUser);

      const newUserProfile = this.userProfileRepository.create({
        ...userProfile,
        user: savedUser,
      });
      await queryRunner.manager.save(newUserProfile);

      await queryRunner.commitTransaction();

      return savedUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async createAdminUser(createAdminDto: CreateAdminDto): Promise<User> {
    const user = await this.findUserByEmail(createAdminDto.email);
    if (user) {
      throw new ConflictException('이미 존재하는 이메일입니다.');
    }

    const {
      email,
      password,
      name,
      careUnitCategory,
      careUnitAddress,
      careUnitName,
      latitude,
      longitude,
      imageUrl,
    } = createAdminDto;

    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newUser = this.userRepository.create({
        email,
        password,
        role: UserRole.ADMIN,
      });
      const savedUser = await queryRunner.manager.save(newUser);

      const careUnit = await this.careUnitService.findCareUnitByFilters(
        latitude,
        longitude,
        careUnitAddress,
        careUnitName,
        careUnitCategory,
      );

      if (!careUnit) {
        throw new NotFoundException('존재하지 않는 의료기관입니다.');
      }

      const newUserProfile = this.userProfileRepository.create({
        name,
        address: careUnit[0].address,
        nickname: careUnit[0].name,
        user: savedUser,
      });

      if (imageUrl) {
        const image = await this.imagesService.createBusinessLicenseImage(
          imageUrl,
          savedUser,
          careUnit[0],
        );
        newUserProfile.image = image;
      }

      await queryRunner.manager.save(newUserProfile);

      await queryRunner.commitTransaction();

      return savedUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findUsers(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['userProfile'],
    });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['userProfile'],
    });
  }

  async findUserById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['userProfile'],
    });
  }

  async isExistEmail(email: string): Promise<boolean> {
    const user = await this.findUserByEmail(email);
    if (user) {
      return true;
    }
    return false;
  }

  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new NotFoundException('유저를 찾을 수 없습니다.');
    }

    const { email, password, ...userProfile } = updateUserDto;

    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(
        User,
        { id: userId },
        { email, password },
      );

      if (userProfile) {
        await queryRunner.manager.update(
          UserProfile,
          { user: { id: userId } },
          { ...userProfile },
        );
      }

      await queryRunner.commitTransaction();

      const updatedUser = await this.findUserById(userId);
      if (!updatedUser) {
        throw new NotFoundException('업데이트된 유저를 찾을 수 없습니다.');
      }
      return updatedUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteUser(userId: string) {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new NotFoundException('유저를 찾을 수 없습니다.');
    }

    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.delete(UserProfile, { user: { id: userId } });
      await queryRunner.manager.delete(User, { id: userId });
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  async updateUserRefreshToken(userId: string, refreshToken: string) {
    if (!userId) {
      throw new NotFoundException('유저 아이디가 없습니다.');
    }
    const user = await this.findUserById(userId);
    if (!user) {
      throw new NotFoundException('유저를 찾을 수 없습니다.');
    }

    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(User, { id: userId }, { refreshToken });
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteUserRefreshToken(userId: string) {
    if (!userId) {
      throw new NotFoundException('유저 아이디가 없습니다.');
    }
    const user = await this.findUserById(userId);
    if (!user) {
      throw new NotFoundException('유저를 찾을 수 없습니다.');
    }

    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(
        User,
        { id: userId },
        { refreshToken: null },
      );
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
