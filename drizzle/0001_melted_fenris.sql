CREATE TABLE `catalog_imports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fileName` varchar(255),
	`format` enum('json','csv') NOT NULL,
	`status` enum('preview','applied','rejected') NOT NULL,
	`sourceCount` int NOT NULL DEFAULT 0,
	`certificationCount` int NOT NULL DEFAULT 0,
	`itemCount` int NOT NULL DEFAULT 0,
	`summary` text,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `catalog_imports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `catalog_items` (
	`id` varchar(160) NOT NULL,
	`sourceId` varchar(80) NOT NULL,
	`externalId` varchar(255),
	`type` enum('course','event') NOT NULL,
	`title` varchar(255) NOT NULL,
	`provider` varchar(255) NOT NULL,
	`description` text,
	`url` varchar(512),
	`modality` enum('online','in-person','hybrid','self-paced','unknown') NOT NULL DEFAULT 'unknown',
	`status` enum('draft','upcoming','open','ongoing','closed','evergreen') NOT NULL DEFAULT 'draft',
	`startDate` varchar(64),
	`endDate` varchar(64),
	`registrationStart` varchar(64),
	`registrationEnd` varchar(64),
	`durationHours` int,
	`topics` json NOT NULL,
	`certificationIds` json NOT NULL,
	`tags` json NOT NULL,
	`isManualOverride` boolean NOT NULL DEFAULT false,
	`sourceUpdatedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `catalog_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `catalog_sources` (
	`id` varchar(80) NOT NULL,
	`name` varchar(255) NOT NULL,
	`kind` enum('manual','agenda','rss','api') NOT NULL,
	`status` enum('active','paused','archived') NOT NULL DEFAULT 'active',
	`syncPolicy` enum('on-demand','daily','weekly') NOT NULL DEFAULT 'on-demand',
	`homepage` varchar(512) NOT NULL,
	`endpoint` varchar(512),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `catalog_sources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `catalog_sync_runs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceId` varchar(80) NOT NULL,
	`status` enum('running','completed','failed') NOT NULL,
	`foundCount` int NOT NULL DEFAULT 0,
	`newCount` int NOT NULL DEFAULT 0,
	`updatedCount` int NOT NULL DEFAULT 0,
	`error` text,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`finishedAt` timestamp,
	CONSTRAINT `catalog_sync_runs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `certifications` (
	`id` varchar(120) NOT NULL,
	`sourceId` varchar(80) NOT NULL,
	`name` varchar(255) NOT NULL,
	`provider` varchar(255) NOT NULL,
	`level` enum('Base','Intermediário','Avançado') NOT NULL,
	`description` text,
	`url` varchar(512),
	`roadmapStepId` varchar(120),
	`prerequisites` json NOT NULL,
	`topics` json NOT NULL,
	`status` enum('draft','active','archived') NOT NULL DEFAULT 'draft',
	`isManualOverride` boolean NOT NULL DEFAULT false,
	`sourceUpdatedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `certifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `catalog_imports` ADD CONSTRAINT `catalog_imports_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `catalog_items` ADD CONSTRAINT `catalog_items_sourceId_catalog_sources_id_fk` FOREIGN KEY (`sourceId`) REFERENCES `catalog_sources`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `catalog_sync_runs` ADD CONSTRAINT `catalog_sync_runs_sourceId_catalog_sources_id_fk` FOREIGN KEY (`sourceId`) REFERENCES `catalog_sources`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `certifications` ADD CONSTRAINT `certifications_sourceId_catalog_sources_id_fk` FOREIGN KEY (`sourceId`) REFERENCES `catalog_sources`(`id`) ON DELETE no action ON UPDATE no action;