import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddImageAndUpdateAll1744807060375 implements MigrationInterface {
  name = 'AddImageAndUpdateAll1744807060375';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_profile" DROP COLUMN "imgUrl"`);
    await queryRunner.query(
      `CREATE TYPE "public"."images_type_enum" AS ENUM('user_profile', 'care_unit', 'business_license')`,
    );
    await queryRunner.query(
      `ALTER TABLE "images" ADD "type" "public"."images_type_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "images" ADD "userId" uuid`);
    await queryRunner.query(`ALTER TABLE "images" ADD "userProfileId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "images" ADD CONSTRAINT "UQ_33582747742f69800c95025c067" UNIQUE ("userProfileId")`,
    );
    await queryRunner.query(`ALTER TABLE "images" ADD "careUnitId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "images" ADD CONSTRAINT "UQ_2fc78ccb6d7b502b5035238ed22" UNIQUE ("careUnitId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "images" ALTER COLUMN "imgUrl" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "images" ALTER COLUMN "filePath" DROP NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_0e700a702cce5000e98620ceb9" ON "care_unit" ("hpId", "category") `,
    );
    await queryRunner.query(
      `ALTER TABLE "images" ADD CONSTRAINT "FK_96514329909c945f10974aff5f8" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "images" ADD CONSTRAINT "FK_33582747742f69800c95025c067" FOREIGN KEY ("userProfileId") REFERENCES "user_profile"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "images" ADD CONSTRAINT "FK_2fc78ccb6d7b502b5035238ed22" FOREIGN KEY ("careUnitId") REFERENCES "care_unit"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "images" DROP CONSTRAINT "FK_2fc78ccb6d7b502b5035238ed22"`,
    );
    await queryRunner.query(
      `ALTER TABLE "images" DROP CONSTRAINT "FK_33582747742f69800c95025c067"`,
    );
    await queryRunner.query(
      `ALTER TABLE "images" DROP CONSTRAINT "FK_96514329909c945f10974aff5f8"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0e700a702cce5000e98620ceb9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "images" ALTER COLUMN "filePath" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "images" ALTER COLUMN "imgUrl" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "images" DROP CONSTRAINT "UQ_2fc78ccb6d7b502b5035238ed22"`,
    );
    await queryRunner.query(`ALTER TABLE "images" DROP COLUMN "careUnitId"`);
    await queryRunner.query(
      `ALTER TABLE "images" DROP CONSTRAINT "UQ_33582747742f69800c95025c067"`,
    );
    await queryRunner.query(`ALTER TABLE "images" DROP COLUMN "userProfileId"`);
    await queryRunner.query(`ALTER TABLE "images" DROP COLUMN "userId"`);
    await queryRunner.query(`ALTER TABLE "images" DROP COLUMN "type"`);
    await queryRunner.query(`DROP TYPE "public"."images_type_enum"`);
    await queryRunner.query(`ALTER TABLE "user_profile" ADD "imgUrl" text`);
  }
}
