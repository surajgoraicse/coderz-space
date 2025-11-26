CREATE TYPE "public"."audit_actions" AS ENUM('CREATE-SUBDOMAIN', 'DELETE-SUBDOMAIN', 'UPDATE-SUBDOMAIN', 'CREATE-RECORD', 'UPDATE-RECORD', 'DELETE-RECORD', 'VERIFICATION-START', 'VERIFICATION-FAILED', 'VERIFICATION-SUCCESS', 'CLOUDFLARE-ERROR', 'USER-CREATED', 'USER-DELETED', 'USER-UPDATE');--> statement-breakpoint
CREATE TYPE "public"."audit_resource_type" AS ENUM('SUBDOMAIN', 'RECORD', 'USER');--> statement-breakpoint
CREATE TYPE "public"."platform" AS ENUM('VERCEL');--> statement-breakpoint
CREATE TYPE "public"."record_type" AS ENUM('A', 'AAAA', 'CNAME', 'TXT', 'CAA');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('ADMIN', 'USER');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('PENDING', 'PROVISIONING', 'ACTIVE', 'ERROR', 'DELETING', 'DELETED', 'BLOCKED');--> statement-breakpoint
CREATE TYPE "public"."verfication_status" AS ENUM('PENDING', 'VERIFIED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."verification_type" AS ENUM('TXT', 'HTTP');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_type" "role" NOT NULL,
	"actor_id" text,
	"action" "audit_actions" NOT NULL,
	"resource_type" "audit_resource_type" NOT NULL,
	"old_value" text,
	"new_value" text,
	"meta" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "record" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sub_domain_id" uuid NOT NULL,
	"provider_record_id" text NOT NULL,
	"type" "record_type" NOT NULL,
	"content" text NOT NULL,
	"ttl" integer DEFAULT 300 NOT NULL,
	"proxied" boolean DEFAULT true NOT NULL,
	"raw" json,
	"status" "status" DEFAULT 'PENDING' NOT NULL,
	"version" smallint DEFAULT 1 NOT NULL,
	"last_synced_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "record_provider_record_id_unique" UNIQUE("provider_record_id")
);
--> statement-breakpoint
CREATE TABLE "sub_domain" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" text,
	"name" text NOT NULL,
	"fqdn" text NOT NULL,
	"desired_record_type" "record_type",
	"desired_target" text,
	"desired_proxied" boolean DEFAULT true,
	"desired_ttl" integer,
	"status" "status" DEFAULT 'PENDING',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sub_domain_name_unique" UNIQUE("name"),
	CONSTRAINT "sub_domain_fqdn_unique" UNIQUE("fqdn")
);
--> statement-breakpoint
CREATE TABLE "verification_record" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sub_domain_id" uuid,
	"platform" "platform" NOT NULL,
	"verification_type" "verification_type" NOT NULL,
	"name" text NOT NULL,
	"content" text NOT NULL,
	"ttl" integer DEFAULT 60,
	"provider_record_id" text NOT NULL,
	"status" "verfication_status" DEFAULT 'PENDING',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "verification_record_name_unique" UNIQUE("name"),
	CONSTRAINT "verification_record_provider_record_id_unique" UNIQUE("provider_record_id")
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_user_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "record" ADD CONSTRAINT "record_sub_domain_id_sub_domain_id_fk" FOREIGN KEY ("sub_domain_id") REFERENCES "public"."sub_domain"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sub_domain" ADD CONSTRAINT "sub_domain_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_record" ADD CONSTRAINT "verification_record_sub_domain_id_sub_domain_id_fk" FOREIGN KEY ("sub_domain_id") REFERENCES "public"."sub_domain"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");