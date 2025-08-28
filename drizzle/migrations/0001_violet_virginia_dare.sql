ALTER TABLE "attachments" RENAME COLUMN "cloudinary_url" TO "original_name";--> statement-breakpoint
ALTER TABLE "tasks" RENAME COLUMN "assign_to" TO "assigned_to";--> statement-breakpoint
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_assign_to_users_id_fk";
--> statement-breakpoint
ALTER TABLE "attachments" ADD COLUMN "file_size" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "attachments" ADD COLUMN "file_path" varchar(500) NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "created_by" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;