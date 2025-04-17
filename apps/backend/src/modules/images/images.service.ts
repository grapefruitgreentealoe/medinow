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
import { S3Service } from '../s3/s3.service';

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
    private readonly s3Service: S3Service,
  ) {}

  /**
   * 파일을 S3에 업로드하고 URL 반환
   * @param file 업로드할 파일
   * @param type 이미지 타입
   * @returns 업로드된 파일의 URL
   */
  async uploadFileToS3(
    file: Express.Multer.File,
    type: ImageType,
  ): Promise<string> {
    if (!file) {
      throw new BadRequestException('파일이 없습니다.');
    }

    try {
      // 이미지 타입에 따라 디렉토리 설정
      const typeDir = ImageType[type].toLowerCase();
      const dirPath = `images/${typeDir}`;

      // S3에 파일 업로드하고 URL 반환
      return await this.s3Service.uploadFile(file, dirPath);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : '알 수 없는 오류';
      throw new BadRequestException(`파일 업로드 실패: ${errorMessage}`);
    }
  }

  /**
   * 사업자등록증 이미지 업로드
   * @param file 업로드할 파일
   * @returns 업로드된 파일의 URL
   */
  async uploadBusinessLicenseImage(file: Express.Multer.File): Promise<string> {
    return this.uploadFileToS3(file, ImageType.BUSINESS_LICENSE);
  }

  /**
   * 사용자 프로필 이미지 업로드
   * @param file 업로드할 파일
   * @returns 업로드된 파일의 URL
   */
  async uploadUserProfileImage(file: Express.Multer.File): Promise<string> {
    return this.uploadFileToS3(file, ImageType.USER_PROFILE);
  }

  /**
   * 의료기관 이미지 업로드
   * @param file 업로드할 파일
   * @returns 업로드된 파일의 URL
   */
  async uploadCareUnitImage(file: Express.Multer.File): Promise<string> {
    return this.uploadFileToS3(file, ImageType.CARE_UNIT);
  }

  /**
   * URL을 기반으로 이미지 엔티티 생성
   * @param imageUrl 이미지 URL
   * @param type 이미지 타입
   * @param user 이미지 소유자 (선택적)
   * @param careUnit 이미지 관련 의료기관 (선택적)
   * @returns 생성된 이미지 엔티티
   */
  async createImageFromUrl(
    imageUrl: string,
    type: ImageType,
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
        type,
        user: user || null,
        careUnit: careUnit || null,
      });

      return await this.imageRepository.save(image);
    } catch (error: any) {
      throw new BadRequestException(`이미지 생성 실패: ${error.message}`);
    }
  }

  /**
   * 사업자등록증 이미지 엔티티 생성
   * @param imageUrl 이미지 URL
   * @param user 사용자 (선택적)
   * @param careUnit 의료기관 (선택적)
   * @returns 생성된 이미지 엔티티
   */
  async createBusinessLicenseImage(
    imageUrl: string,
    user?: User,
    careUnit?: CareUnit,
  ) {
    return this.createImageFromUrl(
      imageUrl,
      ImageType.BUSINESS_LICENSE,
      user,
      careUnit,
    );
  }

  /**
   * 사용자 프로필 이미지 엔티티 생성
   * @param imageUrl 이미지 URL
   * @param user 사용자 (선택적)
   * @returns 생성된 이미지 엔티티
   */
  async createUserProfileImage(imageUrl: string, user?: User) {
    return this.createImageFromUrl(imageUrl, ImageType.USER_PROFILE, user);
  }

  /**
   * 의료기관 이미지 엔티티 생성
   * @param imageUrl 이미지 URL
   * @param careUnit 의료기관 (선택적)
   * @returns 생성된 이미지 엔티티
   */
  async createCareUnitImage(imageUrl: string, careUnit?: CareUnit) {
    return this.createImageFromUrl(
      imageUrl,
      ImageType.CARE_UNIT,
      undefined,
      careUnit,
    );
  }

  /**
   * 사용자의 최신 사업자등록증 이미지 찾기
   * @param userId 사용자 ID
   * @returns 사업자등록증 이미지 또는 null
   */
  async findUserBusinessLicense(userId: string) {
    return this.imageRepository.findOne({
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
    return this.imageRepository.findOne({
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

  /**
   * 특정 타입의 이미지 조회
   * @param type 이미지 타입
   * @returns 이미지 목록
   */
  async findByType(type: ImageType) {
    return this.imageRepository.find({ where: { type } });
  }

  /**
   * 특정 사용자의 이미지 조회
   * @param userId 사용자 ID
   * @returns 이미지 목록
   */
  async findByUser(userId: string) {
    return this.imageRepository.find({
      where: { user: { id: userId } },
    });
  }

  /**
   * 특정 의료기관의 이미지 조회
   * @param careUnitId 의료기관 ID
   * @returns 이미지 목록
   */
  async findByCareUnit(careUnitId: string) {
    return this.imageRepository.find({
      where: { careUnit: { id: careUnitId } },
    });
  }

  /**
   * 이미지와 엔티티 연결 해제
   * @param id 이미지 ID
   * @returns 연결 해제된 이미지
   */
  async unlinkFromEntities(id: string) {
    const image = await this.findById(id);
    image.user = null;
    image.userProfile = null;
    image.careUnit = null;
    return this.imageRepository.save(image);
  }
}
