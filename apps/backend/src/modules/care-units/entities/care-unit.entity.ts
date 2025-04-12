import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity()
export class CareUnit extends BaseEntity {
  @Column()
  name: string;

  @Column()
  address: string;

  @Column()
  tel: string;

  @Column()
  category: string;

  @Column()
  hpid: string;

  @Column()
  mondayOpen: string;

  @Column()
  mondayClose: string;

  @Column()
  tuesdayOpen: string;

  @Column()
  tuesdayClose: string;

  @Column()
  wednesdayOpen: string;

  @Column()
  wednesdayClose: string;

  @Column()
  thursdayOpen: string;

  @Column()
  thursdayClose: string;

  @Column()
  fridayOpen: string;

  @Column()
  fridayClose: string;

  @Column()
  saturdayOpen: string;

  @Column()
  saturdayClose: string;

  @Column()
  sundayOpen: string;

  @Column()
  sundayClose: string;

  @Column()
  holidayOpen: string;

  @Column()
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
