import { BaseEntity } from 'src/common/entities/base.entity';
import { CareUnit } from 'src/modules/care-units/entities/care-unit.entity';
import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Unique,
} from 'typeorm';
import { Review } from 'src/modules/reviews/entities/review.entity';

@Entity()
@Unique(['careUnitId', 'name'])
export class Department extends BaseEntity {
  @Column()
  name: string;

  @Column()
  careUnitId: string;

  @ManyToOne(() => CareUnit, (careUnit) => careUnit.departments)
  @JoinColumn({ name: 'careUnitId' })
  careUnit: CareUnit;

  @OneToMany(() => Review, (review) => review.department, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  reviews: Review[];
}
