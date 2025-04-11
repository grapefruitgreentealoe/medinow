import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity } from 'typeorm';
import { UserRole } from '../../../../../../packages/shared/enums/roles.enum';

@Entity()
export class User extends BaseEntity {
  @Column()
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column()
  name: string;

  @Column()
  nickname: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  age: number;

  @Column({ enum: UserRole, default: UserRole.USER })
  role: UserRole;
}
