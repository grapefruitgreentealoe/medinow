import { Entity, Column, CreateDateColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('sync_logs')
export class SyncLog extends BaseEntity {
  @Column()
  syncType: string; // 'hospital', 'department'

  @CreateDateColumn()
  startedAt: Date;

  @Column({ nullable: true, type: 'timestamp' })
  completedAt: Date;

  @Column({ default: 0 })
  processedItems: number;

  @Column({ default: 0 })
  addedItems: number;

  @Column({ default: 0 })
  updatedItems: number;

  @Column({ default: false })
  isSuccess: boolean;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;
}
