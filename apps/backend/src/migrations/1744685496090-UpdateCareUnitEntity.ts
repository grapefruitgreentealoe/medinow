import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateCareUnitEntity1744685496090 implements MigrationInterface {
    name = 'UpdateCareUnitEntity1744685496090'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "care_unit" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" character varying, "address" character varying NOT NULL, "tel" character varying NOT NULL, "category" character varying NOT NULL, "hpid" character varying NOT NULL, "mondayOpen" double precision, "mondayClose" double precision, "tuesdayOpen" double precision, "tuesdayClose" double precision, "wednesdayOpen" double precision, "wednesdayClose" double precision, "thursdayOpen" double precision, "thursdayClose" double precision, "fridayOpen" double precision, "fridayClose" double precision, "saturdayOpen" double precision, "saturdayClose" double precision, "sundayOpen" double precision, "sundayClose" double precision, "holidayOpen" double precision, "holidayClose" double precision, "lat" double precision NOT NULL, "lng" double precision NOT NULL, "is_badged" boolean NOT NULL DEFAULT false, "now_open" boolean NOT NULL DEFAULT true, "kakao_url" character varying, CONSTRAINT "PK_fe56782437562292635efedffa9" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "care_unit"`);
    }

}
