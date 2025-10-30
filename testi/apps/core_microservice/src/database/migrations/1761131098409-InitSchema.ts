import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1761131098409 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        CREATE TABLE "users" (
            "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            "role" varchar(20) DEFAULT 'User',
            "disabled" boolean DEFAULT false,
            "created_at" TIMESTAMP DEFAULT now(),
            "created_by" uuid,
            "updated_at" TIMESTAMP DEFAULT now(),
            "updated_by" uuid
        );
    `);

    await queryRunner.query(`
        CREATE TABLE "accounts" (
            "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            "user_id" uuid NOT NULL REFERENCES users(id),
            "email" varchar(255) UNIQUE NOT NULL,
            "password_hash" varchar(255) NOT NULL,
            "provider" varchar(20) DEFAULT 'local',
            "provider_id" varchar(255),
            "last_login_at" TIMESTAMP,
            "created_at" TIMESTAMP DEFAULT now(),
            "created_by" uuid,
            "updated_at" TIMESTAMP DEFAULT now(),
            "updated_by" uuid
        );
    `);

    await queryRunner.query(`
        CREATE TABLE "profiles" (
            "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            "user_id" uuid NOT NULL REFERENCES users(id),
            "username" varchar(50) UNIQUE NOT NULL,
            "display_name" varchar(100) NOT NULL,
            "birthday" date NOT NULL,
            "bio" text,
            "avatar_url" varchar(500),
            "is_public" boolean DEFAULT true,
            "created_at" TIMESTAMP DEFAULT now(),
            "created_by" uuid,
            "updated_at" TIMESTAMP DEFAULT now(),
            "updated_by" uuid,
            "deleted" boolean DEFAULT false
        );
    `);

    await queryRunner.query(`
        CREATE TABLE "profiles_follows" (
            "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            "follower_profile_id" uuid NOT NULL REFERENCES profiles(id),
            "followed_profile_id" uuid NOT NULL REFERENCES profiles(id),
            "accepted" boolean,
            "created_at" TIMESTAMP DEFAULT now(),
            "created_by" uuid,
            "updated_at" TIMESTAMP DEFAULT now(),
            "updated_by" uuid,
            UNIQUE("follower_profile_id", "followed_profile_id")
        );
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "profiles_follows";`);
        await queryRunner.query(`DROP TABLE "profiles";`);
        await queryRunner.query(`DROP TABLE "accounts";`);
        await queryRunner.query(`DROP TABLE "users";`);
    }

}
