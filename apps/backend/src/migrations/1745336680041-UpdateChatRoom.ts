import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateChatRoom1745336680041 implements MigrationInterface {
    name = 'UpdateChatRoom1745336680041'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_7f52e11d11d4e8cc4122435286"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_05711d5ec4b9ced96437cf0919"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_05711d5ec4b9ced96437cf0919" ON "chat_rooms" ("care_unit_id", "user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_7f52e11d11d4e8cc4122435286" ON "chat_messages" ("room_id") `);
    }

}
