import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateReviewRatings1745424585958 implements MigrationInterface {
  name = 'UpdateReviewRatings1745424585958';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "care_unit" ADD "averageRating" double precision NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "rating"`);
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "rating" double precision NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "rating"`);
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "rating" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" DROP COLUMN "averageRating"`,
    );
  }
}
