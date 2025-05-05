import { BaseEntity } from '../../../common/entities/base.entity';
import { Column, Entity, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { UserProfile } from '../../users/entities/user-profile.entity';
import { CareUnit } from '../../care-units/entities/care-unit.entity';
import { ImageType } from '../../../common/enums/imageType.enum';
@Entity('images')
export class Image extends BaseEntity {
  //프론트에서 접근 가능한 S3 퍼블릭 url
  @Column({ type: 'text', nullable: true })
  imgUrl: string | null;

  //S3 내부 경로 (원본 파일명 포함한 경로)
  @Column({ type: 'text', nullable: true })
  filePath: string | null;

  @Column({ type: 'enum', enum: ImageType, nullable: true })
  type: ImageType | null;

  @OneToOne(() => UserProfile, (userProfile) => userProfile.image, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  userProfile: UserProfile | null;

  @OneToOne(() => CareUnit, (careUnit) => careUnit.images, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  careUnit: CareUnit | null;
}
