import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from './entities/image.entity';
import { S3Service } from '../s3/s3.service';
import { ImageType } from '../../common/enums/imageType.enum';
import { User } from '../users/entities/user.entity';
import { UserProfile } from '../users/entities/user-profile.entity';
import { CareUnit } from '../care-units/entities/care-unit.entity';

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
    private readonly s3Service: S3Service,
  ) {}

  /**
   * 기본 이미지 업로드 메서드
   * @param file 업로드할 파일
   * @param type 이미지 타입
   * @returns 생성된 이미지 엔티티
   */
  async uploadImage(file: Express.Multer.File, type?: ImageType) {
    if (!file) {
      throw new BadRequestException('업로드할 파일이 없습니다.');
    }

    try {
      // 이미지 타입에 따라 디렉토리 설정
      const typeDir = type ? ImageType[type].toLowerCase() : 'general';
      const dirPath = `images/${typeDir}`;

      // S3에 파일 업로드
      const imgUrl = await this.s3Service.uploadFile(file, dirPath);

      // 이미지 엔티티 생성 및 저장
      const image = this.imageRepository.create({
        imgUrl,
        filePath: dirPath, // 나중에 삭제할 때 사용하기 위해 경로 저장
        type: type || null,
      });

      return await this.imageRepository.save(image);
    } catch (error: any) {
      throw new BadRequestException(`이미지 업로드 실패: ${error.message}`);
    }
  }

  /**
   * 사업자등록증 이미지 업로드 (회원가입용)
   * @param file 업로드할 파일
   * @param user 이미지를 소유할 사용자
   * @returns 생성된 이미지 엔티티
   */
  async uploadBusinessLicense(
    file: Express.Multer.File,
    user: User,
    careUnit: CareUnit,
  ) {
    if (!file) {
      throw new BadRequestException('사업자등록증 파일이 없습니다.');
    }

    try {
      // 사업자등록증 이미지 업로드
      const image = await this.uploadImage(file, ImageType.BUSINESS_LICENSE);

      // 사용자와 연결
      image.user = user;
      image.careUnit = careUnit;

      // 저장 및 반환
      return await this.imageRepository.save(image);
    } catch (error: any) {
      throw new BadRequestException(
        `사업자등록증 업로드 실패: ${error.message}`,
      );
    }
  }

  /**
   * 사용자 프로필 이미지 업로드
   * @param file 업로드할 파일
   * @param userId 이미지를 소유할 사용자 ID
   * @param userProfile 이미지를 연결할 사용자 프로필
   * @returns 생성된 이미지 엔티티
   */
  async uploadProfileImage(
    file: Express.Multer.File,
    userId: string,
    userProfile: UserProfile,
  ) {
    if (!file) {
      throw new BadRequestException('프로필 이미지 파일이 없습니다.');
    }

    try {
      // 프로필 이미지 업로드
      const image = await this.uploadImage(file, ImageType.USER_PROFILE);

      // 사용자 및 프로필과 연결
      image.user = { id: userId } as User;
      image.userProfile = userProfile;

      // 저장 및 반환
      return await this.imageRepository.save(image);
    } catch (error: any) {
      throw new BadRequestException(
        `프로필 이미지 업로드 실패: ${error.message}`,
      );
    }
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

  /**
   * 이미지 삭제
   * @param id 삭제할 이미지 ID
   * @returns 삭제 결과
   */
  async deleteImage(id: string) {
    const image = await this.findById(id);

    // S3에서 파일 삭제
    if (image.imgUrl) {
      await this.s3Service.deleteFile(image.imgUrl);
    }

    // DB에서 이미지 삭제
    return await this.imageRepository.remove(image);
  }

  // 4. 의료기관 이미지 업로드
  async uploadCareUnitImage(file: Express.Multer.File, careUnit: CareUnit) {
    const image = await this.uploadImage(file, ImageType.CARE_UNIT);
    image.careUnit = careUnit;
    return await this.imageRepository.save(image);
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
