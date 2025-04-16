import { MigrationInterface, QueryRunner } from "typeorm";

export class AddImageAndDepartmentsAndCongestionAndUpdateAll1744822925806 implements MigrationInterface {
    name = 'AddImageAndDepartmentsAndCongestionAndUpdateAll1744822925806'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "department" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" character varying NOT NULL, "careUnitId" uuid NOT NULL, CONSTRAINT "PK_9a2213262c1593bffb581e382f5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "congestion_time" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "hour" integer NOT NULL, "congestionLevel" character varying NOT NULL, CONSTRAINT "PK_9a85e1a80841c34b077de9e7bf7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_profile" DROP COLUMN "imgUrl"`);
        await queryRunner.query(`ALTER TABLE "images" ADD "type" "public"."images_type_enum"`);
        await queryRunner.query(`ALTER TABLE "images" ADD "userId" uuid`);
        await queryRunner.query(`ALTER TABLE "images" ADD "userProfileId" uuid`);
        await queryRunner.query(`ALTER TABLE "images" ADD CONSTRAINT "UQ_33582747742f69800c95025c067" UNIQUE ("userProfileId")`);
        await queryRunner.query(`ALTER TABLE "images" ADD "careUnitId" uuid`);
        await queryRunner.query(`ALTER TABLE "images" ADD CONSTRAINT "UQ_2fc78ccb6d7b502b5035238ed22" UNIQUE ("careUnitId")`);
        await queryRunner.query(`ALTER TABLE "images" ALTER COLUMN "imgUrl" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "images" ALTER COLUMN "filePath" DROP NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_8a09d89012fc8496c369ccb538" ON "care_unit" ("hpId", "category") `);
        await queryRunner.query(`ALTER TABLE "department" ADD CONSTRAINT "FK_3d04dea315d964b2f6442560953" FOREIGN KEY ("careUnitId") REFERENCES "care_unit"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "images" ADD CONSTRAINT "FK_96514329909c945f10974aff5f8" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "images" ADD CONSTRAINT "FK_33582747742f69800c95025c067" FOREIGN KEY ("userProfileId") REFERENCES "user_profile"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "images" ADD CONSTRAINT "FK_2fc78ccb6d7b502b5035238ed22" FOREIGN KEY ("careUnitId") REFERENCES "care_unit"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "images" DROP CONSTRAINT "FK_2fc78ccb6d7b502b5035238ed22"`);
        await queryRunner.query(`ALTER TABLE "images" DROP CONSTRAINT "FK_33582747742f69800c95025c067"`);
        await queryRunner.query(`ALTER TABLE "images" DROP CONSTRAINT "FK_96514329909c945f10974aff5f8"`);
        await queryRunner.query(`ALTER TABLE "department" DROP CONSTRAINT "FK_3d04dea315d964b2f6442560953"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8a09d89012fc8496c369ccb538"`);
        await queryRunner.query(`ALTER TABLE "images" ALTER COLUMN "filePath" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "images" ALTER COLUMN "imgUrl" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "images" DROP CONSTRAINT "UQ_2fc78ccb6d7b502b5035238ed22"`);
        await queryRunner.query(`ALTER TABLE "images" DROP COLUMN "careUnitId"`);
        await queryRunner.query(`ALTER TABLE "images" DROP CONSTRAINT "UQ_33582747742f69800c95025c067"`);
        await queryRunner.query(`ALTER TABLE "images" DROP COLUMN "userProfileId"`);
        await queryRunner.query(`ALTER TABLE "images" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "images" DROP COLUMN "type"`);
        await queryRunner.query(`ALTER TABLE "user_profile" ADD "imgUrl" text`);
        await queryRunner.query(`DROP TABLE "congestion_time"`);
        await queryRunner.query(`DROP TABLE "department"`);
    }

}
