import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAuditColumnsToProfiles20260831163000 implements MigrationInterface {
  name = 'AddAuditColumnsToProfiles20260831163000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "profiles"
        ADD COLUMN "created_by" uuid,
        ADD COLUMN "updated_by" uuid,
        ADD COLUMN "deleted_by" uuid,
        ADD COLUMN "deleted_at" TIMESTAMP WITH TIME ZONE;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "profiles"
        DROP COLUMN "created_by",
        DROP COLUMN "updated_by",
        DROP COLUMN "deleted_by",
        DROP COLUMN "deleted_at";
    `);
  }
}
