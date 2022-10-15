import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1665738969793 implements MigrationInterface {
    name = 'migration1665738969793'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "signups" DROP COLUMN "type"`);
        await queryRunner.query(`CREATE TYPE "public"."signups_type_enum" AS ENUM('CONSULTATION', 'DIAGNOSTIC')`);
        await queryRunner.query(`ALTER TABLE "signups" ADD "type" "public"."signups_type_enum" NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "signups" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."signups_type_enum"`);
        await queryRunner.query(`ALTER TABLE "signups" ADD "type" numeric NOT NULL`);
    }

}
