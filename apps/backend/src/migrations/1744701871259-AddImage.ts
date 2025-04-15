import { MigrationInterface, QueryRunner } from "typeorm";

export class AddImage1744701871259 implements MigrationInterface {
    name = 'AddImage1744701871259'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "images" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "imgUrl" text NOT NULL, "filePath" text NOT NULL, CONSTRAINT "PK_1fe148074c6a1a91b63cb9ee3c9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user" ADD "imgUrl" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "imgUrl"`);
        await queryRunner.query(`DROP TABLE "images"`);
    }

}
