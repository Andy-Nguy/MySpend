import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPersonalColumnsToProfiles20260831170000 implements MigrationInterface {
  name = 'AddPersonalColumnsToProfiles20260831170000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "profiles"
        ADD COLUMN "first_name" varchar(100),
        ADD COLUMN "last_name" varchar(100),
        ADD COLUMN "display_name" varchar(200),
        ADD COLUMN "mobile_number" varchar(20),
        ADD COLUMN "date_of_birth" date,
        ADD COLUMN "avatar_url" text;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "profiles"
        DROP COLUMN "first_name",
        DROP COLUMN "last_name",
        DROP COLUMN "display_name",
        DROP COLUMN "mobile_number",
        DROP COLUMN "date_of_birth",
        DROP COLUMN "avatar_url";
    `);
  }
}
