import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateProfile1744738921631 implements MigrationInterface {
  name = 'UpdateProfile1744738921631';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_profile" DROP CONSTRAINT "FK_572546c5c4c36796e8af87502cd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profile" DROP CONSTRAINT "FK_51cb79b5555effaf7d69ba1cff9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_2ffc8d3455097079866bfca4d47"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "UQ_2ffc8d3455097079866bfca4d47"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "userProfileId"`);
    await queryRunner.query(
      `ALTER TABLE "user_profile" ADD CONSTRAINT "FK_572546c5c4c36796e8af87502cd" FOREIGN KEY ("careUnitId") REFERENCES "care_unit"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profile" ADD CONSTRAINT "FK_51cb79b5555effaf7d69ba1cff9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_profile" DROP CONSTRAINT "FK_51cb79b5555effaf7d69ba1cff9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profile" DROP CONSTRAINT "FK_572546c5c4c36796e8af87502cd"`,
    );
    await queryRunner.query(`ALTER TABLE "user" ADD "userProfileId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "UQ_2ffc8d3455097079866bfca4d47" UNIQUE ("userProfileId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_2ffc8d3455097079866bfca4d47" FOREIGN KEY ("userProfileId") REFERENCES "user_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profile" ADD CONSTRAINT "FK_51cb79b5555effaf7d69ba1cff9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profile" ADD CONSTRAINT "FK_572546c5c4c36796e8af87502cd" FOREIGN KEY ("careUnitId") REFERENCES "care_unit"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
