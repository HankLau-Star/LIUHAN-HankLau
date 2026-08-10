CREATE TABLE `media_assets` (
	`id` text PRIMARY KEY NOT NULL,
	`object_key` text NOT NULL,
	`filename` text NOT NULL,
	`content_type` text NOT NULL,
	`size` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`created_by` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `media_assets_object_key_unique` ON `media_assets` (`object_key`);--> statement-breakpoint
CREATE INDEX `idx_media_assets_created_at` ON `media_assets` (`created_at`);
