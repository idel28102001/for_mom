import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1666278984988 implements MigrationInterface {
    name = 'migration1666278984988'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('USER', 'ADMIN')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP DEFAULT now(), "telegramId" character varying NOT NULL, "phoneNumber" character varying, "username" character varying, "firstname" character varying, "lastname" character varying, "role" "public"."users_role_enum" NOT NULL DEFAULT 'USER', CONSTRAINT "UQ_df18d17f84763558ac84192c754" UNIQUE ("telegramId"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."signups_type_enum" AS ENUM('CONSULTATION', 'DIAGNOSTIC')`);
        await queryRunner.query(`CREATE TABLE "signups" ("id" SERIAL NOT NULL, "date" TIMESTAMP NOT NULL, "type" "public"."signups_type_enum" NOT NULL, "comment" character varying, "duration" numeric NOT NULL, "calendarEventId" character varying NOT NULL, "userId" integer, CONSTRAINT "PK_00508d1ace4b24227069d2ffcda" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "signups" ADD CONSTRAINT "FK_b529b22149280f81ad73eb02e54" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "signups" DROP CONSTRAINT "FK_b529b22149280f81ad73eb02e54"`);
        await queryRunner.query(`DROP TABLE "signups"`);
        await queryRunner.query(`DROP TYPE "public"."signups_type_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }

}
