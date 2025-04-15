import { MigrationInterface, QueryRunner } from "typeorm";

export class RelationCareUnitAndUser1744694597013 implements MigrationInterface {
    name = 'RelationCareUnitAndUser1744694597013'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "careUnitId" uuid`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_c6c51f05496ddd8f0b085ceb373" UNIQUE ("careUnitId")`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_c6c51f05496ddd8f0b085ceb373" FOREIGN KEY ("careUnitId") REFERENCES "care_unit"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_c6c51f05496ddd8f0b085ceb373"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_c6c51f05496ddd8f0b085ceb373"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "careUnitId"`);
    }

}
