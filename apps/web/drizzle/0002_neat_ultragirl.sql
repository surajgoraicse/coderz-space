ALTER TABLE "sub_domain" RENAME COLUMN "name" TO "sub_domain_name";--> statement-breakpoint
ALTER TABLE "sub_domain" DROP CONSTRAINT "sub_domain_name_unique";--> statement-breakpoint
ALTER TABLE "sub_domain" ALTER COLUMN "desired_proxied" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "sub_domain" ADD CONSTRAINT "sub_domain_sub_domain_name_unique" UNIQUE("sub_domain_name");