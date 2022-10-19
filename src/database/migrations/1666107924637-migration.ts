import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1666107924637 implements MigrationInterface {
    name = 'migration1666107924637'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "signups" RENAME COLUMN "calendarId" TO "calendarEventId"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "signups" RENAME COLUMN "calendarEventId" TO "calendarId"`);
    }

}
