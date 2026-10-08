ALTER TABLE `users` ADD `age` int;--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `sessionHash` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `sessionExpiresAt` timestamp;