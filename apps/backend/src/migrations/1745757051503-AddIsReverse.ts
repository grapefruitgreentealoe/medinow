import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsReverse1745757051503 implements MigrationInterface {
    name = 'AddIsReverse1745757051503'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "care_unit" ADD "isReverse" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "care_unit" DROP COLUMN "isReverse"`);
    }

}
