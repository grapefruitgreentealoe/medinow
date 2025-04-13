import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity } from 'typeorm';
import { UserRole } from '../../../common/enums/roles.enum';
import { Exclude } from 'class-transformer';
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
}
