ALTER TABLE "audit_logs" ALTER COLUMN "actor_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."role";--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('ADMIN', 'USERS');--> statement-breakpoint
ALTER TABLE "audit_logs" ALTER COLUMN "actor_type" SET DATA TYPE "public"."role" USING "actor_type"::"public"."role";--> statement-breakpoint
ALTER TABLE "sub_domain" ALTER COLUMN "owner_id" SET NOT NULL;