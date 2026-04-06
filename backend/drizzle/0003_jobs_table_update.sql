-- Migration to add type and data columns to jobs table
-- Handles both rename from scrape_jobs (existing DBs) and fresh installs

-- Check if scrape_jobs exists and rename it
-- SQLite doesn't have IF EXISTS for ALTER TABLE, so we use a workaround

-- For existing databases: rename scrape_jobs to jobs if it exists
-- For fresh databases: this will fail silently and the jobs table already exists from schema

-- Step 1: If scrape_jobs exists, rename to jobs_temp
CREATE TABLE IF NOT EXISTS `jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL DEFAULT 'scrape',
	`data` text,
	`status` text DEFAULT 'pending',
	`result` text,
	`error` text,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);

-- Migrate data from scrape_jobs if it exists (using INSERT OR IGNORE to handle if already migrated)
INSERT OR IGNORE INTO `jobs` (`id`, `type`, `data`, `status`, `result`, `error`, `created_at`, `updated_at`)
SELECT `id`, 'scrape', json_object('url', `url`), `status`, `result`, `error`, `created_at`, `updated_at`
FROM `scrape_jobs` WHERE EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='scrape_jobs');

-- Drop old table if it exists
DROP TABLE IF EXISTS `scrape_jobs`;
