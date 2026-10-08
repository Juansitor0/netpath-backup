import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { userProfiles, users } from "../drizzle/schema";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

function verifyPassword(password: string, stored: string) {
  const [salt, expected] = stored.split(":");
  if (!salt || !expected) return false;
  const actual = scryptSync(password, salt, 64);
  const expectedBuffer = Buffer.from(expected, "hex");
  return actual.length === expectedBuffer.length && timingSafeEqual(actual, expectedBuffer);
}

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createLocalAccount(input: { name: string; age: number; roleTitle: string; email: string; password: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const email = normalizeEmail(input.email);
  const openId = `local:${randomBytes(24).toString("hex")}`;
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing.length) throw new Error("EMAIL_ALREADY_EXISTS");
  const sessionToken = randomBytes(32).toString("base64url");
  const now = new Date();
  await db.insert(users).values({
    openId,
    name: input.name.trim(),
    email,
    age: input.age,
    passwordHash: hashPassword(input.password),
    sessionHash: hashSessionToken(sessionToken),
    sessionExpiresAt: new Date(Date.now() + SESSION_TTL_MS),
    loginMethod: "local",
    lastSignedIn: now,
  });
  const created = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (created[0]) {
    await db.insert(userProfiles).values({ userId: created[0].id, roleTitle: input.roleTitle.trim(), skills: [] });
  }
  return { sessionToken };
}

export async function authenticateLocalAccount(emailInput: string, password: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const email = normalizeEmail(emailInput);
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const user = result[0];
  if (!user?.passwordHash || !verifyPassword(password, user.passwordHash)) throw new Error("INVALID_CREDENTIALS");
  const sessionToken = randomBytes(32).toString("base64url");
  await db.update(users).set({ sessionHash: hashSessionToken(sessionToken), sessionExpiresAt: new Date(Date.now() + SESSION_TTL_MS), lastSignedIn: new Date() }).where(eq(users.id, user.id));
  return { sessionToken };
}

export async function getUserBySessionToken(token: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(users).where(eq(users.sessionHash, hashSessionToken(token))).limit(1);
  const user = result[0];
  if (!user || !user.sessionExpiresAt || user.sessionExpiresAt.getTime() <= Date.now()) return null;
  return user;
}

export async function revokeLocalSession(token: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ sessionHash: null, sessionExpiresAt: null }).where(eq(users.sessionHash, hashSessionToken(token)));
}
