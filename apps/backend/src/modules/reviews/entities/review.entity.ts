import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { CareUnit } from '../../care-units/entities/care-unit.entity';
import { Department } from '../../departments/entities/department.entity';

@Entity('reviews')
export class Review extends BaseEntity {
  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'text', nullable: true })
  thankMessage: string;

  @Column({ type: 'float', default: 0 })
  rating: number;

  @Column({ type: 'boolean', default: true })
  isPublic: boolean;

  @ManyToOne(() => User, (user) => user.reviews)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => CareUnit, (careUnit) => careUnit.reviews)
  @JoinColumn({ name: 'careUnitId' })
  careUnit: CareUnit;

  @ManyToOne(() => Department, (department) => department.reviews, {
    nullable: true,
  })
  @JoinColumn({ name: 'departmentId' })
  department: Department;
}
