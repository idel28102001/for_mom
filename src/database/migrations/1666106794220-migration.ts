import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1666106794220 implements MigrationInterface {
    name = 'migration1666106794220'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "signups" ADD "calendarId" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "signups" DROP COLUMN "calendarId"`);
    }

}
