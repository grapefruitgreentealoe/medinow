import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCascadeFavorites1745548200864 implements MigrationInterface {
  name = 'AddCascadeFavorites1745548200864';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d7b2ca5e4f6ef01b772bd4c5a0"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_d7b2ca5e4f6ef01b772bd4c5a0" ON "favorites" ("careUnitId", "userId") `,
    );
  }
}
