import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddChat1745112357425 implements MigrationInterface {
  name = 'AddChat1745112357425';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "chat_messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "content" text NOT NULL, "isRead" boolean NOT NULL DEFAULT false, "sender_id" uuid NOT NULL, "room_id" uuid NOT NULL, CONSTRAINT "PK_40c55ee0e571e268b0d3cd37d10" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_45dd9d4361859a685053fce954" ON "chat_messages" ("room_id", "createdAt") `,
    );
    await queryRunner.query(
      `CREATE TABLE "chat_rooms" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "user_id" uuid NOT NULL, "care_unit_id" uuid NOT NULL, "lastMessageAt" TIMESTAMP, "unreadCount" integer NOT NULL DEFAULT '0', "lastReadAt" TIMESTAMP, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_c69082bd83bffeb71b0f455bd59" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_05711d5ec4b9ced96437cf0919" ON "chat_rooms" ("user_id", "care_unit_id") `,
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
      `DROP INDEX "public"."IDX_05711d5ec4b9ced96437cf0919"`,
    );
    await queryRunner.query(`DROP TABLE "chat_rooms"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_45dd9d4361859a685053fce954"`,
    );
    await queryRunner.query(`DROP TABLE "chat_messages"`);
  }
}
