import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1665569690268 implements MigrationInterface {
    name = 'migration1665569690268'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "referallink"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "referallink" character varying`);
    }

}
