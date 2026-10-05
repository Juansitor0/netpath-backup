CREATE TABLE `resume_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`originalFileName` varchar(255) NOT NULL,
	`mimeType` varchar(80) NOT NULL,
	`sizeBytes` int NOT NULL,
	`storageKey` varchar(512) NOT NULL,
	`fileHash` varchar(64) NOT NULL,
	`encryptedProfileData` text NOT NULL,
	`status` enum('draft','confirmed','archived') NOT NULL DEFAULT 'draft',
	`consentGrantedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `resume_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `resume_documents` ADD CONSTRAINT `resume_documents_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;