import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserProfile1744737694435 implements MigrationInterface {
  name = 'AddUserProfile1744737694435';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_c6c51f05496ddd8f0b085ceb373"`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_profile" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" text NOT NULL, "nickname" text NOT NULL, "address" text, "age" integer, "imgUrl" text, "careUnitId" uuid, "userId" uuid, CONSTRAINT "REL_572546c5c4c36796e8af87502c" UNIQUE ("careUnitId"), CONSTRAINT "REL_51cb79b5555effaf7d69ba1cff" UNIQUE ("userId"), CONSTRAINT "PK_f44d0cd18cfd80b0fed7806c3b7" PRIMARY KEY ("id"))`,
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
    await queryRunner.query(`ALTER TABLE "user" ADD "userProfileId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "UQ_2ffc8d3455097079866bfca4d47" UNIQUE ("userProfileId")`,
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
      `ALTER TABLE "user" ADD "role" "public"."user_role_enum" NOT NULL DEFAULT 'USER'`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profile" ADD CONSTRAINT "FK_572546c5c4c36796e8af87502cd" FOREIGN KEY ("careUnitId") REFERENCES "care_unit"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profile" ADD CONSTRAINT "FK_51cb79b5555effaf7d69ba1cff9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_2ffc8d3455097079866bfca4d47" FOREIGN KEY ("userProfileId") REFERENCES "user_profile"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_2ffc8d3455097079866bfca4d47"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profile" DROP CONSTRAINT "FK_51cb79b5555effaf7d69ba1cff9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profile" DROP CONSTRAINT "FK_572546c5c4c36796e8af87502cd"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "role"`);
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
      `ALTER TABLE "care_unit" ADD CONSTRAINT "UQ_b4b96513b1e4db7b8f967e98b75" UNIQUE ("hpid")`,
    );
    await queryRunner.query(
      `ALTER TABLE "care_unit" ALTER COLUMN "name" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "UQ_2ffc8d3455097079866bfca4d47"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "userProfileId"`);
    await queryRunner.query(`ALTER TABLE "user" ADD "imgUrl" text`);
    await queryRunner.query(`ALTER TABLE "user" ADD "careUnitId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "UQ_c6c51f05496ddd8f0b085ceb373" UNIQUE ("careUnitId")`,
    );
    await queryRunner.query(`ALTER TABLE "user" ADD "address" text`);
    await queryRunner.query(`ALTER TABLE "user" ADD "nickname" text NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user" ADD "name" text NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user" ADD "age" integer`);
    await queryRunner.query(`DROP TABLE "user_profile"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_c6c51f05496ddd8f0b085ceb373" FOREIGN KEY ("careUnitId") REFERENCES "care_unit"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
