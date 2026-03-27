CREATE TABLE `cars` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`vin` text,
	`make` text,
	`model` text,
	`year` integer,
	`trim` text,
	`exterior_color` text,
	`interior_color` text,
	`listing_price` integer,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `files` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`content_type` text NOT NULL,
	`key` text NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
