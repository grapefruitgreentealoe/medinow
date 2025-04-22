import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDepartments1745302566481 implements MigrationInterface {
  name = 'UpdateDepartments1745302566481';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "department" ADD CONSTRAINT "UQ_9ed3577950b87aab1b2b95f222f" UNIQUE ("careUnitId", "name")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "department" DROP CONSTRAINT "UQ_9ed3577950b87aab1b2b95f222f"`,
    );
  }
}
