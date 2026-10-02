import { boolean, int, json, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/** Usuários da autenticação Manus e permissões do produto. */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

/** Perfil profissional e estado do onboarding do usuário. */
export const userProfiles = mysqlTable("user_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique().references(() => users.id),
  roleTitle: varchar("roleTitle", { length: 160 }),
  yearsExperience: int("yearsExperience"),
  currentLevel: mysqlEnum("currentLevel", ["base", "fundamentos", "pleno", "senior"]).default("base").notNull(),
  onboardingStatus: mysqlEnum("onboardingStatus", ["not_started", "in_progress", "completed"]).default("not_started").notNull(),
  quizScore: int("quizScore"),
  skills: json("skills").$type<string[]>().notNull(),
  confirmedAt: timestamp("confirmedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Respostas e recomendação geradas durante o onboarding. */
export const onboardingSessions = mysqlTable("onboarding_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  status: mysqlEnum("status", ["started", "completed", "abandoned"]).default("started").notNull(),
  answers: json("answers").$type<Record<string, unknown>>().notNull(),
  recommendedLevel: mysqlEnum("recommendedLevel", ["base", "fundamentos", "pleno", "senior"]),
  confirmedLevel: mysqlEnum("confirmedLevel", ["base", "fundamentos", "pleno", "senior"]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Progresso real dos nós da trilha, separado do catálogo editorial. */
export const userProgress = mysqlTable("user_progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  stepId: varchar("stepId", { length: 120 }).notNull(),
  status: mysqlEnum("status", ["not_started", "in_progress", "completed", "skipped"]).default("not_started").notNull(),
  source: mysqlEnum("source", ["manual", "onboarding", "import"]).default("manual").notNull(),
  completedAt: timestamp("completedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userStepUnique: uniqueIndex("user_progress_user_step_unique").on(table.userId, table.stepId),
}));

/** Fontes editoriais, agendas e APIs que alimentam o catálogo. */
export const catalogSources = mysqlTable("catalog_sources", {
  id: varchar("id", { length: 80 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  kind: mysqlEnum("kind", ["manual", "agenda", "rss", "api"]).notNull(),
  status: mysqlEnum("status", ["active", "paused", "archived"]).default("active").notNull(),
  syncPolicy: mysqlEnum("syncPolicy", ["on-demand", "daily", "weekly"]).default("on-demand").notNull(),
  homepage: varchar("homepage", { length: 512 }).notNull(),
  endpoint: varchar("endpoint", { length: 512 }),
  notes: text("notes"),
  scheduleTaskUid: varchar("scheduleTaskUid", { length: 120 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Certificações editoriais relacionadas às etapas da trilha. */
export const certifications = mysqlTable("certifications", {
  id: varchar("id", { length: 120 }).primaryKey(),
  sourceId: varchar("sourceId", { length: 80 }).notNull().references(() => catalogSources.id),
  name: varchar("name", { length: 255 }).notNull(),
  provider: varchar("provider", { length: 255 }).notNull(),
  level: mysqlEnum("level", ["Base", "Intermediário", "Avançado"]).notNull(),
  description: text("description"),
  url: varchar("url", { length: 512 }),
  roadmapStepId: varchar("roadmapStepId", { length: 120 }),
  prerequisites: json("prerequisites").$type<string[]>().notNull(),
  topics: json("topics").$type<string[]>().notNull(),
  status: mysqlEnum("status", ["draft", "active", "archived"]).default("draft").notNull(),
  isManualOverride: boolean("isManualOverride").default(false).notNull(),
  sourceUpdatedAt: timestamp("sourceUpdatedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Cursos e eventos encontrados em agendas externas ou cadastrados manualmente. */
export const catalogItems = mysqlTable("catalog_items", {
  id: varchar("id", { length: 160 }).primaryKey(),
  sourceId: varchar("sourceId", { length: 80 }).notNull().references(() => catalogSources.id),
  externalId: varchar("externalId", { length: 255 }),
  type: mysqlEnum("type", ["course", "event"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  provider: varchar("provider", { length: 255 }).notNull(),
  description: text("description"),
  url: varchar("url", { length: 512 }),
  modality: mysqlEnum("modality", ["online", "in-person", "hybrid", "self-paced", "unknown"]).default("unknown").notNull(),
  status: mysqlEnum("status", ["draft", "upcoming", "open", "ongoing", "closed", "evergreen"]).default("draft").notNull(),
  startDate: varchar("startDate", { length: 64 }),
  endDate: varchar("endDate", { length: 64 }),
  registrationStart: varchar("registrationStart", { length: 64 }),
  registrationEnd: varchar("registrationEnd", { length: 64 }),
  durationHours: int("durationHours"),
  topics: json("topics").$type<string[]>().notNull(),
  certificationIds: json("certificationIds").$type<string[]>().notNull(),
  tags: json("tags").$type<string[]>().notNull(),
  isManualOverride: boolean("isManualOverride").default(false).notNull(),
  sourceUpdatedAt: timestamp("sourceUpdatedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Histórico de arquivos importados e suas contagens para auditoria. */
export const catalogImports = mysqlTable("catalog_imports", {
  id: int("id").autoincrement().primaryKey(),
  fileName: varchar("fileName", { length: 255 }),
  format: mysqlEnum("format", ["json", "csv"]).notNull(),
  status: mysqlEnum("status", ["preview", "applied", "rejected"]).notNull(),
  sourceCount: int("sourceCount").default(0).notNull(),
  certificationCount: int("certificationCount").default(0).notNull(),
  itemCount: int("itemCount").default(0).notNull(),
  summary: text("summary"),
  createdBy: int("createdBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/** Histórico de sincronizações de fontes externas. */
export const catalogSyncRuns = mysqlTable("catalog_sync_runs", {
  id: int("id").autoincrement().primaryKey(),
  sourceId: varchar("sourceId", { length: 80 }).notNull().references(() => catalogSources.id),
  status: mysqlEnum("status", ["running", "completed", "failed"]).notNull(),
  foundCount: int("foundCount").default(0).notNull(),
  newCount: int("newCount").default(0).notNull(),
  updatedCount: int("updatedCount").default(0).notNull(),
  error: text("error"),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  finishedAt: timestamp("finishedAt"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;
export type OnboardingSession = typeof onboardingSessions.$inferSelect;
export type UserProgress = typeof userProgress.$inferSelect;
export type CatalogSource = typeof catalogSources.$inferSelect;
export type InsertCatalogSource = typeof catalogSources.$inferInsert;
export type CatalogItem = typeof catalogItems.$inferSelect;
export type InsertCatalogItem = typeof catalogItems.$inferInsert;
export type Certification = typeof certifications.$inferSelect;
export type InsertCertification = typeof certifications.$inferInsert;
export type CatalogImport = typeof catalogImports.$inferSelect;
export type CatalogSyncRun = typeof catalogSyncRuns.$inferSelect;
