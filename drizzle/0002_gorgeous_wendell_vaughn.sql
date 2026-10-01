CREATE TABLE `onboarding_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`status` enum('started','completed','abandoned') NOT NULL DEFAULT 'started',
	`answers` json NOT NULL,
	`recommendedLevel` enum('base','fundamentos','pleno','senior'),
	`confirmedLevel` enum('base','fundamentos','pleno','senior'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `onboarding_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`roleTitle` varchar(160),
	`yearsExperience` int,
	`currentLevel` enum('base','fundamentos','pleno','senior') NOT NULL DEFAULT 'base',
	`onboardingStatus` enum('not_started','in_progress','completed') NOT NULL DEFAULT 'not_started',
	`quizScore` int,
	`skills` json NOT NULL,
	`confirmedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_profiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `user_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stepId` varchar(120) NOT NULL,
	`status` enum('not_started','in_progress','completed','skipped') NOT NULL DEFAULT 'not_started',
	`source` enum('manual','onboarding','import') NOT NULL DEFAULT 'manual',
	`completedAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_progress_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_progress_user_step_unique` UNIQUE(`userId`,`stepId`)
);
--> statement-breakpoint
ALTER TABLE `onboarding_sessions` ADD CONSTRAINT `onboarding_sessions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_profiles` ADD CONSTRAINT `user_profiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_progress` ADD CONSTRAINT `user_progress_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;