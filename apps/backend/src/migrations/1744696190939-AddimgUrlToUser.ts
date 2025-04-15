import { MigrationInterface, QueryRunner } from "typeorm";

export class AddimgUrlToUser1744696190939 implements MigrationInterface {
    name = 'AddimgUrlToUser1744696190939'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "imgUrl" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "imgUrl"`);
    }

}
