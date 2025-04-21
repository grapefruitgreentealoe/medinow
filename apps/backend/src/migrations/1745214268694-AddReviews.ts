import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReviews1745214268694 implements MigrationInterface {
  name = 'AddReviews1745214268694';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_45dd9d4361859a685053fce954"`,
    );
    await queryRunner.query(
      `CREATE TABLE "reviews" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "content" text, "thankMessage" text, "rating" integer NOT NULL DEFAULT '0', "isPublic" boolean NOT NULL DEFAULT true, "userId" uuid, "careUnitId" uuid, "departmentId" uuid, CONSTRAINT "PK_231ae565c273ee700b283f15c1d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_messages" DROP CONSTRAINT "FK_9e5fc47ecb06d4d7b84633b1718"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_messages" DROP CONSTRAINT "FK_7f52e11d11d4e8cc41224352869"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_messages" ALTER COLUMN "sender_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_messages" ALTER COLUMN "room_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_rooms" DROP CONSTRAINT "FK_e3b9a8a898a459cb91b2ee97350"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_rooms" DROP CONSTRAINT "FK_ce3c0b2c88cc30c36cdc60aa1e1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_05711d5ec4b9ced96437cf0919"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_rooms" ALTER COLUMN "user_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_rooms" ALTER COLUMN "care_unit_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7f52e11d11d4e8cc4122435286" ON "chat_messages" ("room_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_05711d5ec4b9ced96437cf0919" ON "chat_rooms" ("user_id", "care_unit_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "FK_7ed5659e7139fc8bc039198cc1f" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "FK_ee93c64719ba6e2c603e4ae87c1" FOREIGN KEY ("careUnitId") REFERENCES "care_unit"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "FK_053e4ffc1d796c7bff5d1692d59" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_messages" ADD CONSTRAINT "FK_9e5fc47ecb06d4d7b84633b1718" FOREIGN KEY ("sender_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_messages" ADD CONSTRAINT "FK_7f52e11d11d4e8cc41224352869" FOREIGN KEY ("room_id") REFERENCES "chat_rooms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_rooms" ADD CONSTRAINT "FK_e3b9a8a898a459cb91b2ee97350" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_rooms" ADD CONSTRAINT "FK_ce3c0b2c88cc30c36cdc60aa1e1" FOREIGN KEY ("care_unit_id") REFERENCES "care_unit"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "chat_rooms" DROP CONSTRAINT "FK_ce3c0b2c88cc30c36cdc60aa1e1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_rooms" DROP CONSTRAINT "FK_e3b9a8a898a459cb91b2ee97350"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_messages" DROP CONSTRAINT "FK_7f52e11d11d4e8cc41224352869"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_messages" DROP CONSTRAINT "FK_9e5fc47ecb06d4d7b84633b1718"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_053e4ffc1d796c7bff5d1692d59"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_ee93c64719ba6e2c603e4ae87c1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_7ed5659e7139fc8bc039198cc1f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_05711d5ec4b9ced96437cf0919"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7f52e11d11d4e8cc4122435286"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_rooms" ALTER COLUMN "care_unit_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_rooms" ALTER COLUMN "user_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_05711d5ec4b9ced96437cf0919" ON "chat_rooms" ("care_unit_id", "user_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_rooms" ADD CONSTRAINT "FK_ce3c0b2c88cc30c36cdc60aa1e1" FOREIGN KEY ("care_unit_id") REFERENCES "care_unit"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_rooms" ADD CONSTRAINT "FK_e3b9a8a898a459cb91b2ee97350" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_messages" ALTER COLUMN "room_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_messages" ALTER COLUMN "sender_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_messages" ADD CONSTRAINT "FK_7f52e11d11d4e8cc41224352869" FOREIGN KEY ("room_id") REFERENCES "chat_rooms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_messages" ADD CONSTRAINT "FK_9e5fc47ecb06d4d7b84633b1718" FOREIGN KEY ("sender_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`DROP TABLE "reviews"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_45dd9d4361859a685053fce954" ON "chat_messages" ("createdAt", "room_id") `,
    );
  }
}
