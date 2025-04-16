import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('images')
export class Image extends BaseEntity {
  //프론트에서 접근 가능한 S3 퍼블릭 url
  @Column({ type: 'text' })
  imgUrl: string;

  //S3 내부 경로 (원본 파일명 포함한 경로)
  @Column({ type: 'text' })
  filePath: string;
}
