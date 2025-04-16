import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserAndCareUnit1744466074450 implements MigrationInterface {
  name = 'AddUserAndCareUnit1744466074450';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "care_unit" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" character varying NOT NULL, "address" character varying NOT NULL, "tel" character varying NOT NULL, "category" character varying NOT NULL, "hpId" character varying NOT NULL, "mondayOpen" character varying, "mondayClose" character varying, "tuesdayOpen" character varying, "tuesdayClose" character varying, "wednesdayOpen" character varying, "wednesdayClose" character varying, "thursdayOpen" character varying, "thursdayClose" character varying, "fridayOpen" character varying, "fridayClose" character varying, "saturdayOpen" character varying, "saturdayClose" character varying, "sundayOpen" character varying, "sundayClose" character varying, "holidayOpen" character varying, "holidayClose" character varying, "lat" integer NOT NULL, "lng" integer NOT NULL, "is_badged" boolean NOT NULL DEFAULT false, "now_open" boolean NOT NULL DEFAULT true, "kakao_url" character varying, CONSTRAINT "UQ_b4b96513b1e4db7b8f967e98b75" UNIQUE ("hpId"), CONSTRAINT "PK_fe56782437562292635efedffa9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "email" character varying NOT NULL, "password" character varying, "name" character varying NOT NULL, "nickname" character varying NOT NULL, "address" character varying, "age" integer, "role" character varying NOT NULL DEFAULT 'USER', CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "UQ_e2364281027b926b879fa2fa1e0" UNIQUE ("nickname"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "care_unit"`);
  }
}
