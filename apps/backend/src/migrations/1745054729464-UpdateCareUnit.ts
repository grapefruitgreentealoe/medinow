import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateCareUnit1745054729464 implements MigrationInterface {
    name = 'UpdateCareUnit1745054729464'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "favorites" DROP CONSTRAINT "FK_35a6b05ee3b624d0de01ee50593"`);
        await queryRunner.query(`ALTER TABLE "favorites" DROP CONSTRAINT "FK_61b9e65dbb6cb8702d2faee2922"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_09661eb38361553044b5dc26d5"`);
        await queryRunner.query(`CREATE TABLE "notice" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "title" character varying NOT NULL, "content" character varying NOT NULL, "category" character varying NOT NULL, "isPublished" boolean NOT NULL, CONSTRAINT "PK_705062b14410ff1a04998f86d72" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "favorites" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "favorites" DROP COLUMN "care_unit_id"`);
        await queryRunner.query(`ALTER TABLE "care_unit" DROP COLUMN "is_badged"`);
        await queryRunner.query(`ALTER TABLE "care_unit" DROP COLUMN "now_open"`);
        await queryRunner.query(`ALTER TABLE "care_unit" DROP COLUMN "kakao_url"`);
        await queryRunner.query(`ALTER TABLE "favorites" ADD "userId" uuid`);
        await queryRunner.query(`ALTER TABLE "favorites" ADD "careUnitId" uuid`);
        await queryRunner.query(`ALTER TABLE "care_unit" ADD "isBadged" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "care_unit" ADD "nowOpen" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "care_unit" ADD "kakaoUrl" character varying`);
        await queryRunner.query(`ALTER TYPE "public"."images_type_enum" RENAME TO "images_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."images_type_enum" AS ENUM('userProfile', 'careUnit', 'businessLicense')`);
        await queryRunner.query(`ALTER TABLE "images" ALTER COLUMN "type" TYPE "public"."images_type_enum" USING "type"::"text"::"public"."images_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."images_type_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."user_role_enum" RENAME TO "user_role_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('user', 'admin', 'superAdmin')`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" TYPE "public"."user_role_enum" USING "role"::"text"::"public"."user_role_enum"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'user'`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum_old"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_d7b2ca5e4f6ef01b772bd4c5a0" ON "favorites" ("userId", "careUnitId") `);
        await queryRunner.query(`ALTER TABLE "favorites" ADD CONSTRAINT "FK_e747534006c6e3c2f09939da60f" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "favorites" ADD CONSTRAINT "FK_ea0a851f389fca88f670035400b" FOREIGN KEY ("careUnitId") REFERENCES "care_unit"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "favorites" DROP CONSTRAINT "FK_ea0a851f389fca88f670035400b"`);
        await queryRunner.query(`ALTER TABLE "favorites" DROP CONSTRAINT "FK_e747534006c6e3c2f09939da60f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d7b2ca5e4f6ef01b772bd4c5a0"`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum_old" AS ENUM('USER', 'ADMIN', 'SUPER-ADMIN')`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" TYPE "public"."user_role_enum_old" USING "role"::"text"::"public"."user_role_enum_old"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'USER'`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."user_role_enum_old" RENAME TO "user_role_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."images_type_enum_old" AS ENUM('user_profile', 'care_unit', 'business_license')`);
        await queryRunner.query(`ALTER TABLE "images" ALTER COLUMN "type" TYPE "public"."images_type_enum_old" USING "type"::"text"::"public"."images_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."images_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."images_type_enum_old" RENAME TO "images_type_enum"`);
        await queryRunner.query(`ALTER TABLE "care_unit" DROP COLUMN "kakaoUrl"`);
        await queryRunner.query(`ALTER TABLE "care_unit" DROP COLUMN "nowOpen"`);
        await queryRunner.query(`ALTER TABLE "care_unit" DROP COLUMN "isBadged"`);
        await queryRunner.query(`ALTER TABLE "favorites" DROP COLUMN "careUnitId"`);
        await queryRunner.query(`ALTER TABLE "favorites" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "care_unit" ADD "kakao_url" character varying`);
        await queryRunner.query(`ALTER TABLE "care_unit" ADD "now_open" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "care_unit" ADD "is_badged" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "favorites" ADD "care_unit_id" uuid`);
        await queryRunner.query(`ALTER TABLE "favorites" ADD "user_id" uuid`);
        await queryRunner.query(`DROP TABLE "notice"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_09661eb38361553044b5dc26d5" ON "favorites" ("care_unit_id", "user_id") `);
        await queryRunner.query(`ALTER TABLE "favorites" ADD CONSTRAINT "FK_61b9e65dbb6cb8702d2faee2922" FOREIGN KEY ("care_unit_id") REFERENCES "care_unit"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "favorites" ADD CONSTRAINT "FK_35a6b05ee3b624d0de01ee50593" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
