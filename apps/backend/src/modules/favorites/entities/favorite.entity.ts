import { Entity, ManyToOne, JoinColumn, Index } from 'typeorm';
import { CareUnit } from '../../care-units/entities/care-unit.entity';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('favorites')
export class Favorite extends BaseEntity {
  @ManyToOne(() => User, (user) => user.favorites, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => CareUnit, (careUnit) => careUnit.favorites, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'careUnitId' })
  careUnit: CareUnit;
}
