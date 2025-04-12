import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { CareUnitCategory } from '../../../common/enums/careUnits.enum';
@Entity()
export class CareUnit extends BaseEntity {
  @Column()
  name: string;

  @Column()
  address: string;

  @Column()
  tel: string;

  @Column({ enum: CareUnitCategory })
  category: string;

  @Column({ unique: true })
  hpid: string;

  @Column({ nullable: true })
  mondayOpen: string;

  @Column({ nullable: true })
  mondayClose: string;

  @Column({ nullable: true })
  tuesdayOpen: string;

  @Column({ nullable: true })
  tuesdayClose: string;

  @Column({ nullable: true })
  wednesdayOpen: string;

  @Column({ nullable: true })
  wednesdayClose: string;

  @Column({ nullable: true })
  thursdayOpen: string;

  @Column({ nullable: true })
  thursdayClose: string;

  @Column({ nullable: true })
  fridayOpen: string;

  @Column({ nullable: true })
  fridayClose: string;

  @Column({ nullable: true })
  saturdayOpen: string;

  @Column({ nullable: true })
  saturdayClose: string;

  @Column({ nullable: true })
  sundayOpen: string;

  @Column({ nullable: true })
  sundayClose: string;

  @Column({ nullable: true })
  holidayOpen: string;

  @Column({ nullable: true })
  holidayClose: string;

  @Column()
  lat: number;

  @Column()
  lng: number;

  @Column({ default: false })
  is_badged: boolean;

  @Column({ default: true })
  now_open: boolean;

  @Column({ nullable: true })
  kakao_url: string;
}
