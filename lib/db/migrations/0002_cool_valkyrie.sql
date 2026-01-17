CREATE TABLE `custom_foods` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`calories_per_100g` real,
	`protein_per_100g` real,
	`carbs_per_100g` real,
	`fats_per_100g` real,
	`unit` text DEFAULT 'g' NOT NULL,
	`unit_size` real,
	`calories_per_piece` real,
	`protein_per_piece` real,
	`carbs_per_piece` real,
	`fats_per_piece` real,
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
