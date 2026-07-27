CREATE TYPE "public"."status" AS ENUM('Green', 'Yellow', 'Red');--> statement-breakpoint
CREATE TYPE "public"."utility_type" AS ENUM('Electricity', 'Water', 'Gas');--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"zone_id" uuid NOT NULL,
	"utility_type" "utility_type" NOT NULL,
	"reporter_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"device_uuid" varchar(255) NOT NULL,
	"trust_score" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "users_device_uuid_unique" UNIQUE("device_uuid")
);
--> statement-breakpoint
CREATE TABLE "zones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"zone_name" varchar(255) NOT NULL,
	"boundary" varchar(10000),
	"current_status" "status" DEFAULT 'Green' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_zone_id_zones_id_fk" FOREIGN KEY ("zone_id") REFERENCES "public"."zones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;