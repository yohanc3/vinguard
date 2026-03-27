CREATE TABLE `scrape_jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	`status` text DEFAULT 'pending',
	`result` text,
	`error` text,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
