import { BaseEntity } from 'src/common/entities/base.entity';
import { CareUnit } from 'src/modules/care-units/entities/care-unit.entity';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';

@Entity()
export class Department extends BaseEntity {
  @Column()
  name: string;

  @Column()
  careUnitId: string;

  @ManyToOne(() => CareUnit, (careUnit) => careUnit.departments)
  @JoinColumn({ name: 'careUnitId' })
  careUnit: CareUnit;
}
