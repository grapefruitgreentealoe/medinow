import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity } from 'typeorm';

export enum CongestionLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

@Entity()
export class CongestionTime extends BaseEntity {
  @Column()
  hour: number;

  @Column({ enum: CongestionLevel })
  congestionLevel: CongestionLevel;
}
