import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAllAndUpdateAll1744824199694 implements MigrationInterface {
  name = 'AddAllAndUpdateAll1744824199694';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_c6c51f05496ddd8f0b085ceb373"`,
    );
    await queryRunner.query(
      `CREATE TABLE "department" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" character varying NOT NULL, "careUnitId" uuid NOT NULL, CONSTRAINT "PK_9a2213262c1593bffb581e382f5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_profile" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" text NOT NULL, "nickname" text NOT NULL, "address" text, "age" integer, "careUnitId" uuid, "userId" uuid, CONSTRAINT "REL_572546c5c4c36796e8af87502c" UNIQUE ("careUnitId"), CONSTRAINT "REL_51cb79b5555effaf7d69ba1cff" UNIQUE ("userId"), CONSTRAINT "PK_f44d0cd18cfd80b0fed7806c3b7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "congestion_time" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "hour" integer NOT NULL, "congestionLevel" character varying NOT NULL, CONSTRAINT "PK_9a85e1a80841c34b077de9e7bf7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "age"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "name"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "nickname"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "address"`);
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "UQ_c6c51f05496ddd8f0b085ceb373"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "careUnitId"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "imgUrl"`);
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
      `ALTER TABLE "care_unit" ALTER COLUMN "name" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" DROP CONSTRAINT "UQ_b4b96513b1e4db7b8f967e98b75"`,
    );
    await queryRunner.query(`ALTER TABLE "care_unit" DROP COLUMN "mondayOpen"`);
    await queryRunner.query(
      `ALTER TABLE "care_unit" ADD "mondayOpen" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" DROP COLUMN "mondayClose"`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" ADD "mondayClose" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" DROP COLUMN "tuesdayOpen"`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" ADD "tuesdayOpen" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" DROP COLUMN "tuesdayClose"`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" ADD "tuesdayClose" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" DROP COLUMN "wednesdayOpen"`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" ADD "wednesdayOpen" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" DROP COLUMN "wednesdayClose"`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" ADD "wednesdayClose" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" DROP COLUMN "thursdayOpen"`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" ADD "thursdayOpen" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" DROP COLUMN "thursdayClose"`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" ADD "thursdayClose" double precision`,
    );
    await queryRunner.query(`ALTER TABLE "care_unit" DROP COLUMN "fridayOpen"`);
    await queryRunner.query(
      `ALTER TABLE "care_unit" ADD "fridayOpen" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" DROP COLUMN "fridayClose"`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" ADD "fridayClose" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" DROP COLUMN "saturdayOpen"`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" ADD "saturdayOpen" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" DROP COLUMN "saturdayClose"`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" ADD "saturdayClose" double precision`,
    );
    await queryRunner.query(`ALTER TABLE "care_unit" DROP COLUMN "sundayOpen"`);
    await queryRunner.query(
      `ALTER TABLE "care_unit" ADD "sundayOpen" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" DROP COLUMN "sundayClose"`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" ADD "sundayClose" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" DROP COLUMN "holidayOpen"`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" ADD "holidayOpen" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" DROP COLUMN "holidayClose"`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" ADD "holidayClose" double precision`,
    );
    await queryRunner.query(`ALTER TABLE "care_unit" DROP COLUMN "lat"`);
    await queryRunner.query(
      `ALTER TABLE "care_unit" ADD "lat" double precision NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "care_unit" DROP COLUMN "lng"`);
    await queryRunner.query(
      `ALTER TABLE "care_unit" ADD "lng" double precision NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "role"`);
    await queryRunner.query(
      `CREATE TYPE "public"."user_role_enum" AS ENUM('USER', 'ADMIN', 'SUPER-ADMIN')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "role" "public"."user_role_enum" NOT NULL DEFAULT 'USER'`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_8a09d89012fc8496c369ccb538" ON "care_unit" ("hpId", "category") `,
    );
    await queryRunner.query(
      `ALTER TABLE "department" ADD CONSTRAINT "FK_3d04dea315d964b2f6442560953" FOREIGN KEY ("careUnitId") REFERENCES "care_unit"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
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
    await queryRunner.query(
      `ALTER TABLE "user_profile" ADD CONSTRAINT "FK_572546c5c4c36796e8af87502cd" FOREIGN KEY ("careUnitId") REFERENCES "care_unit"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profile" ADD CONSTRAINT "FK_51cb79b5555effaf7d69ba1cff9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_profile" DROP CONSTRAINT "FK_51cb79b5555effaf7d69ba1cff9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profile" DROP CONSTRAINT "FK_572546c5c4c36796e8af87502cd"`,
    );
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
      `ALTER TABLE "department" DROP CONSTRAINT "FK_3d04dea315d964b2f6442560953"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8a09d89012fc8496c369ccb538"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "role"`);
    await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "role" character varying NOT NULL DEFAULT 'USER'`,
    );
    await queryRunner.query(`ALTER TABLE "care_unit" DROP COLUMN "lng"`);
    await queryRunner.query(
      `ALTER TABLE "care_unit" ADD "lng" integer NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "care_unit" DROP COLUMN "lat"`);
    await queryRunner.query(
      `ALTER TABLE "care_unit" ADD "lat" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" DROP COLUMN "holidayClose"`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" ADD "holidayClose" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" DROP COLUMN "holidayOpen"`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" ADD "holidayOpen" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" DROP COLUMN "sundayClose"`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" ADD "sundayClose" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "care_unit" DROP COLUMN "sundayOpen"`);
    await queryRunner.query(
      `ALTER TABLE "care_unit" ADD "sundayOpen" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" DROP COLUMN "saturdayClose"`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" ADD "saturdayClose" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" DROP COLUMN "saturdayOpen"`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" ADD "saturdayOpen" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" DROP COLUMN "fridayClose"`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" ADD "fridayClose" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "care_unit" DROP COLUMN "fridayOpen"`);
    await queryRunner.query(
      `ALTER TABLE "care_unit" ADD "fridayOpen" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" DROP COLUMN "thursdayClose"`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" ADD "thursdayClose" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" DROP COLUMN "thursdayOpen"`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" ADD "thursdayOpen" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" DROP COLUMN "wednesdayClose"`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" ADD "wednesdayClose" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" DROP COLUMN "wednesdayOpen"`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" ADD "wednesdayOpen" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" DROP COLUMN "tuesdayClose"`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" ADD "tuesdayClose" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" DROP COLUMN "tuesdayOpen"`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" ADD "tuesdayOpen" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" DROP COLUMN "mondayClose"`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" ADD "mondayClose" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "care_unit" DROP COLUMN "mondayOpen"`);
    await queryRunner.query(
      `ALTER TABLE "care_unit" ADD "mondayOpen" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" ADD CONSTRAINT "UQ_b4b96513b1e4db7b8f967e98b75" UNIQUE ("hpId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" ALTER COLUMN "name" SET NOT NULL`,
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
    await queryRunner.query(`ALTER TABLE "user" ADD "imgUrl" text`);
    await queryRunner.query(`ALTER TABLE "user" ADD "careUnitId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "UQ_c6c51f05496ddd8f0b085ceb373" UNIQUE ("careUnitId")`,
    );
    await queryRunner.query(`ALTER TABLE "user" ADD "address" text`);
    await queryRunner.query(`ALTER TABLE "user" ADD "nickname" text NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user" ADD "name" text NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user" ADD "age" integer`);
    await queryRunner.query(`DROP TABLE "congestion_time"`);
    await queryRunner.query(`DROP TABLE "user_profile"`);
    await queryRunner.query(`DROP TABLE "department"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_c6c51f05496ddd8f0b085ceb373" FOREIGN KEY ("careUnitId") REFERENCES "care_unit"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
