import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDepartmentsAndCongestionTimes1744810071530
  implements MigrationInterface
{
  name = 'AddDepartmentsAndCongestionTimes1744810071530';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0e700a702cce5000e98620ceb9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "congestion_time" ADD "hour" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "congestion_time" ADD "congestionLevel" character varying NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "congestion_time" DROP COLUMN "congestionLevel"`,
    );
    await queryRunner.query(`ALTER TABLE "congestion_time" DROP COLUMN "hour"`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_0e700a702cce5000e98620ceb9" ON "care_unit" ("category", "hpId") `,
    );
  }
}
