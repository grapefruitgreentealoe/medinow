import { BaseEntity } from '../../../common/entities/base.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { UserRole } from '../../../common/enums/roles.enum';
import { Exclude } from 'class-transformer';
import { CareUnit } from 'src/modules/care-units/entities/care-unit.entity';
@Entity()
export class User extends BaseEntity {
  @Column({ type: 'text', unique: true })
  email: string;

  @Exclude()
  @Column({ type: 'text', nullable: true })
  password: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text' })
  nickname: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'integer', nullable: true })
  age: number;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Exclude()
  @Column({ type: 'text', nullable: true, default: null })
  refreshToken: string | null;

  @Column({ type: 'text', nullable: true, default: null })
  imgUrl?: string | null;

  @OneToOne(() => CareUnit, (careUnit) => careUnit.user, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  careUnit: CareUnit | null;
}
