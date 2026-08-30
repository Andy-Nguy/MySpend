import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProfiles20260830000000 implements MigrationInterface {
  name = 'CreateProfiles20260830000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "profiles" (
        "id" uuid NOT NULL,
        "email" text NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_profiles_email" UNIQUE ("email"),
        CONSTRAINT "PK_profiles_id" PRIMARY KEY ("id")
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "profiles"');
  }
}
