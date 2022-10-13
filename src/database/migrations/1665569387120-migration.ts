import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1665569387120 implements MigrationInterface {
    name = 'migration1665569387120'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "signups" ("id" SERIAL NOT NULL, "date" TIMESTAMP NOT NULL, "type" character varying NOT NULL, "messageId" integer, "userId" integer, CONSTRAINT "PK_00508d1ace4b24227069d2ffcda" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP DEFAULT now(), "telegramId" character varying NOT NULL, "phoneNumber" character varying, "username" character varying, "firstname" character varying, "lastname" character varying, "referallink" character varying, "role" character varying NOT NULL DEFAULT 'USER', CONSTRAINT "UQ_df18d17f84763558ac84192c754" UNIQUE ("telegramId"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "signups" ADD CONSTRAINT "FK_b529b22149280f81ad73eb02e54" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "signups" DROP CONSTRAINT "FK_b529b22149280f81ad73eb02e54"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "signups"`);
    }

}
