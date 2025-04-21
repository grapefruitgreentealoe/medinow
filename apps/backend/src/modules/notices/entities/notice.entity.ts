import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity()
export class Notice extends BaseEntity {
  @Column()
  title: string;

  @Column()
  content: string;

  @Column()
  category: string;

  @Column()
  isPublished: boolean;
}
