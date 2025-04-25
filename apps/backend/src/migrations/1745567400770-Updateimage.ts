import { MigrationInterface, QueryRunner } from 'typeorm';

export class Updateimage1745567400770 implements MigrationInterface {
  name = 'Updateimage1745567400770';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "images" DROP CONSTRAINT "FK_96514329909c945f10974aff5f8"`,
    );
    await queryRunner.query(`ALTER TABLE "images" DROP COLUMN "userId"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "images" ADD "userId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "images" ADD CONSTRAINT "FK_96514329909c945f10974aff5f8" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }
}
