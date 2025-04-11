import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUser1744349761880 implements MigrationInterface {
    name = 'AddUser1744349761880'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "email" character varying NOT NULL, "password" character varying, "name" character varying NOT NULL, "nickname" character varying NOT NULL, "address" character varying, "age" integer, "role" character varying NOT NULL DEFAULT 'user', CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
