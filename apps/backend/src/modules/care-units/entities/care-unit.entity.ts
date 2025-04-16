import { Column, Entity, Index, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { CareUnitCategory } from '../../../common/enums/careUnits.enum';
import { UserProfile } from 'src/modules/users/entities/user-profile.entity';
import { Image } from 'src/modules/images/entities/image.entity';

@Entity()
@Index(['hpid', 'category'], { unique: true })
export class CareUnit extends BaseEntity {
  @Column({ nullable: true })
  name: string;

  @Column()
  address: string;

  @Column()
  tel: string;

  @Column({ enum: CareUnitCategory })
  category: string;

  @Column()
  hpid: string;

  @Column({ type: 'float8', nullable: true })
  mondayOpen: number;

  @Column({ type: 'float8', nullable: true })
  mondayClose: number;

  @Column({ type: 'float8', nullable: true })
  tuesdayOpen: number;

  @Column({ type: 'float8', nullable: true })
  tuesdayClose: number;

  @Column({ type: 'float8', nullable: true })
  wednesdayOpen: number;

  @Column({ type: 'float8', nullable: true })
  wednesdayClose: number;

  @Column({ type: 'float8', nullable: true })
  thursdayOpen: number;

  @Column({ type: 'float8', nullable: true })
  thursdayClose: number;

  @Column({ type: 'float8', nullable: true })
  fridayOpen: number;

  @Column({ type: 'float8', nullable: true })
  fridayClose: number;

  @Column({ type: 'float8', nullable: true })
  saturdayOpen: number;

  @Column({ type: 'float8', nullable: true })
  saturdayClose: number;

  @Column({ type: 'float8', nullable: true })
  sundayOpen: number;

  @Column({ type: 'float8', nullable: true })
  sundayClose: number;

  @Column({ type: 'float8', nullable: true })
  holidayOpen: number;

  @Column({ type: 'float8', nullable: true })
  holidayClose: number;

  @Column({ type: 'float8' })
  lat: number;

  @Column({ type: 'float8' })
  lng: number;

  @Column({ default: false })
  is_badged: boolean;

  @Column({ default: true })
  now_open: boolean;

  @Column({ nullable: true })
  kakao_url: string;

  @OneToOne(() => UserProfile, (userProfile) => userProfile.careUnit, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  user: UserProfile | null;

  @OneToOne(() => Image, (image) => image.careUnit, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  images: Image | null;
}
