import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from './entities/image.entity';
import { ImageType } from '../../common/enums/imageType.enum';
import { User } from '../users/entities/user.entity';
import { UserProfile } from '../users/entities/user-profile.entity';
import { CareUnit } from '../care-units/entities/care-unit.entity';

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
  ) {}

  /**
   * URL을 기반으로 이미지 엔티티 생성
   * @param imageUrl 이미지 URL
   * @param type 이미지 타입
   * @param user 이미지 소유자
   * @param careUnit 이미지 관련 의료기관 (선택적)
   * @returns 생성된 이미지 엔티티
   */
  async createImageFromUrl(
    imageUrl: string,
    type: ImageType = ImageType.BUSINESS_LICENSE,
    user?: User,
    careUnit?: CareUnit,
  ) {
    if (!imageUrl) {
      throw new BadRequestException('이미지 URL이 없습니다.');
    }

    try {
      // 이미지 엔티티 생성
      const image = this.imageRepository.create({
        imgUrl: imageUrl,
        type: type,
        user: user || null,
        careUnit: careUnit || null,
      });

      return await this.imageRepository.save(image);
    } catch (error: any) {
      throw new BadRequestException(`이미지 생성 실패: ${error.message}`);
    }
  }

  /**
   * 사업자등록증 이미지 생성
   * @param imageUrl 이미지 URL
   * @param user 사용자
   * @param careUnit 의료기관
   * @returns 생성된 이미지 엔티티
   */
  async createBusinessLicenseImage(
    imageUrl: string,
    user?: User,
    careUnit?: CareUnit,
  ) {
    return await this.createImageFromUrl(
      imageUrl,
      ImageType.BUSINESS_LICENSE,
      user,
      careUnit,
    );
  }

  /**
   * 사용자 프로필 이미지 생성
   * @param imageUrl 이미지 URL
   * @param user 사용자
   * @returns 생성된 이미지 엔티티
   */
  async createUserProfileImage(imageUrl: string, user?: User) {
    return await this.createImageFromUrl(
      imageUrl,
      ImageType.USER_PROFILE,
      user,
    );
  }

  /**
   * 사용자의 최신 사업자등록증 이미지 찾기
   * @param userId 사용자 ID
   * @returns 사업자등록증 이미지 또는 null
   */
  async findUserBusinessLicense(userId: string) {
    return await this.imageRepository.findOne({
      where: {
        user: { id: userId },
        type: ImageType.BUSINESS_LICENSE,
      },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 사용자의 최신 프로필 이미지 찾기
   * @param userId 사용자 ID
   * @returns 프로필 이미지 또는 null
   */
  async findUserProfileImage(userId: string) {
    return await this.imageRepository.findOne({
      where: {
        user: { id: userId },
        type: ImageType.USER_PROFILE,
      },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * ID로 이미지 찾기
   * @param id 이미지 ID
   * @returns 이미지 엔티티
   */
  async findById(id: string) {
    const image = await this.imageRepository.findOne({
      where: { id },
      relations: ['user', 'userProfile', 'careUnit'],
    });

    if (!image) {
      throw new NotFoundException(`이미지를 찾을 수 없습니다. ID: ${id}`);
    }

    return image;
  }

  // 5. 특정 타입의 이미지 조회
  async findByType(type: ImageType) {
    return await this.imageRepository.find({ where: { type } });
  }

  // 6. 특정 사용자의 이미지 조회
  async findByUser(userId: string) {
    return await this.imageRepository.find({
      where: { user: { id: userId } },
    });
  }

  // 7. 이미지 업데이트
  async updateImageType(id: string, type: ImageType) {
    const image = await this.findById(id);
    image.type = type;
    return await this.imageRepository.save(image);
  }

  // 8. 이미지와 엔티티 연결 해제
  async unlinkFromEntities(id: string) {
    const image = await this.findById(id);
    image.user = null;
    image.userProfile = null;
    image.careUnit = null;
    return await this.imageRepository.save(image);
  }
}
