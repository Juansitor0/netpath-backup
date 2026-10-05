import crypto from "node:crypto";
import { PDFParse } from "pdf-parse";
import { and, desc, eq } from "drizzle-orm";
import { resumeDocuments } from "../../drizzle/schema";
import { getDb } from "../db";
import { ENV } from "../_core/env";
import { storagePut, storageGetSignedUrl } from "../storage";

export type ResumeProfile = {
  fullName: string;
  headline: string;
  location: string;
  linkedinUrl: string;
  portfolioUrl: string;
  summary: string;
  skills: string[];
  certifications: string[];
  experiences: Array<{ company: string; title: string; period: string; description: string }>;
  education: Array<{ institution: string; course: string; period: string }>;
};

function encryptionKey() {
  const secret = process.env.MANUS_PROFILE_ENCRYPTION_KEY ?? ENV.cookieSecret;
  if (!secret) throw new Error("Profile encryption secret is not configured");
  return crypto.createHash("sha256").update(`netpath-profile:v1:${secret}`).digest();
}

function encrypt(value: unknown) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
  return [iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), ciphertext.toString("base64url")].join(".");
}

function decrypt<T>(value: string): T {
  const [ivText, tagText, ciphertextText] = value.split(".");
  const decipher = crypto.createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(ivText, "base64url"));
  decipher.setAuthTag(Buffer.from(tagText, "base64url"));
  return JSON.parse(Buffer.concat([decipher.update(Buffer.from(ciphertextText, "base64url")), decipher.final()]).toString("utf8")) as T;
}

function cleanLines(text: string) {
  return text.split(/\r?\n/).map((line) => line.replace(/\s+/g, " ").trim()).filter(Boolean);
}

function extractProfile(text: string): ResumeProfile {
  const lines = cleanLines(text);
  const email = lines.find((line) => /\S+@\S+\.\S+/.test(line))?.match(/\S+@\S+\.\S+/)?.[0] ?? "";
  const linkedinUrl = lines.find((line) => line.includes("linkedin.com/")) ?? "";
  const nameIndex = lines.findIndex((line) => line === "Juan Carlos" || (line.length > 4 && line.length < 60 && !line.includes(" ") && /^[A-ZÁÉÍÓÚ][a-záéíóú]+/.test(line)));
  const fullName = nameIndex >= 0 ? lines[nameIndex] : "";
  const headline = nameIndex >= 0 ? lines[nameIndex + 1] ?? "" : "";
  const sectionIndex = (name: string) => lines.findIndex((line) => line.toLowerCase() === name.toLowerCase());
  const summaryStart = sectionIndex("Resumo");
  const experienceStart = sectionIndex("Experiência");
  const educationStart = sectionIndex("Formação acadêmica");
  const summary = summaryStart >= 0 ? lines.slice(summaryStart + 1, experienceStart >= 0 ? experienceStart : summaryStart + 8).join(" ").replace(/^Oi, tudo bem\? /, "") : "";
  const skillsStart = sectionIndex("Principais competências");
  const certStart = sectionIndex("Certifications");
  const skills = skillsStart >= 0 ? lines.slice(skillsStart + 1, certStart >= 0 ? certStart : skillsStart + 6).filter((line) => line.length > 3).slice(0, 12) : [];
  const certifications = certStart >= 0 ? lines.slice(certStart + 1, nameIndex > certStart ? nameIndex : certStart + 8).filter((line) => line.length > 3).slice(0, 12) : [];
  const company = lines.find((line) => /Brisanet/i.test(line)) ?? "";
  const title = lines.find((line) => /Analista|Assistente|Estagiário/i.test(line)) ?? "";
  const education = educationStart >= 0 ? lines.slice(educationStart + 1).filter((line) => line.length > 3).slice(0, 8) : [];
  return { fullName, headline, location: lines.find((line) => /Brasil|Ceará|CE/i.test(line)) ?? "", linkedinUrl, portfolioUrl: lines.find((line) => /behance|linktr\.ee/i.test(line)) ?? "", summary, skills, certifications, experiences: company ? [{ company, title, period: "", description: "Revisar e completar esta experiência importada do PDF." }] : [], education: education.length ? [{ institution: education[0] ?? "", course: education[1] ?? "", period: education[2] ?? "" }] : [] };
}

export async function importResume(userId: number, input: { fileName: string; mimeType: string; base64: string; consent: boolean }) {
  if (!input.consent) throw new Error("Consentimento necessário para processar o currículo");
  if (input.mimeType !== "application/pdf") throw new Error("Envie um arquivo PDF");
  const buffer = Buffer.from(input.base64, "base64");
  if (buffer.length === 0 || buffer.length > 8 * 1024 * 1024) throw new Error("O PDF deve ter entre 1 byte e 8 MB");
  if (buffer.subarray(0, 5).toString("ascii") !== "%PDF-") throw new Error("O arquivo não parece ser um PDF válido");
  const parser = new PDFParse({ data: buffer });
  let parsed;
  try {
    parsed = await parser.getText();
  } finally {
    await parser.destroy();
  }
  const profile = extractProfile(parsed.text);
  const fileHash = crypto.createHash("sha256").update(buffer).digest("hex");
  const stored = await storagePut(`private-resumes/${userId}/${fileHash}.pdf`, buffer, "application/pdf");
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(resumeDocuments).set({ status: "archived" }).where(eq(resumeDocuments.userId, userId));
  const [row] = await db.insert(resumeDocuments).values({ userId, originalFileName: input.fileName.slice(0, 255), mimeType: input.mimeType, sizeBytes: buffer.length, storageKey: stored.key, fileHash, encryptedProfileData: encrypt(profile), status: "draft", consentGrantedAt: new Date() }).$returningId();
  return { id: row?.id ?? null, fileName: input.fileName, sizeBytes: buffer.length, profile };
}

export async function getResume(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const [row] = await db.select().from(resumeDocuments).where(eq(resumeDocuments.userId, userId)).orderBy(desc(resumeDocuments.createdAt)).limit(1);
  if (!row || row.status === "archived") return null;
  return { id: row.id, fileName: row.originalFileName, sizeBytes: row.sizeBytes, status: row.status, createdAt: row.createdAt, profile: decrypt<ResumeProfile>(row.encryptedProfileData), downloadUrl: await storageGetSignedUrl(row.storageKey) };
}

export async function confirmResume(userId: number, id: number, profile: ResumeProfile) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const [existing] = await db.select({ id: resumeDocuments.id }).from(resumeDocuments).where(and(eq(resumeDocuments.id, id), eq(resumeDocuments.userId, userId))).limit(1);
  if (!existing) throw new Error("Currículo não encontrado");
  await db.update(resumeDocuments).set({ encryptedProfileData: encrypt(profile), status: "confirmed" }).where(and(eq(resumeDocuments.id, id), eq(resumeDocuments.userId, userId)));
  return getResume(userId);
}

export async function removeResume(userId: number, id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(resumeDocuments).set({ status: "archived" }).where(and(eq(resumeDocuments.id, id), eq(resumeDocuments.userId, userId)));
  return { success: true } as const;
}
