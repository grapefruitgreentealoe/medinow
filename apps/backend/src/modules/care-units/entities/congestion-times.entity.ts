import { BaseEntity } from 'src/common/entities/base.entity';
import { CongestionLevel } from 'src/common/enums/congestion.enum';
import { Column, Entity } from 'typeorm';

@Entity()
export class CongestionTime extends BaseEntity {
  @Column()
  hour: number;

  @Column({ enum: CongestionLevel })
  congestionLevel: CongestionLevel;
}
