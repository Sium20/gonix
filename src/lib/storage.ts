import { promises as fs } from "fs";
import path from "path";

/**
 * Storage layer. Local filesystem by default; pluggable backends for Vercel.
 *
 * Backend selection (in priority order):
 *   1. STORAGE_BACKEND=vercel-blob  +  BLOB_READ_WRITE_TOKEN   → Vercel Blob
 *   2. STORAGE_BACKEND=supabase     +  SUPABASE_* env vars     → Supabase Storage
 *   3. (default)                                                  → local FS at STORAGE_DIR
 *
 * On Vercel serverless, local storage does NOT persist between invocations
 * (read-only filesystem except for /tmp). Use a cloud backend in production.
 */

const LOCAL_STORAGE_DIR = process.env.STORAGE_DIR || path.join(process.cwd(), "uploads");

export type StorageBackend = "local" | "vercel-blob" | "supabase";
export type UploadCategory = "id-cards" | "avatars";

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/jpg"]);
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

function detectBackend(): StorageBackend {
  const forced = (process.env.STORAGE_BACKEND || "").toLowerCase();
  if (forced === "vercel-blob" && process.env.BLOB_READ_WRITE_TOKEN) return "vercel-blob";
  if (forced === "supabase" && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) return "supabase";
  return "local";
}

export const STORAGE_BACKEND: StorageBackend = detectBackend();

function safeExtFromMime(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

function makeFilename(category: UploadCategory, ownerId: string, ext: string) {
  return `${category}/${ownerId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
}

async function saveLocal(
  file: File,
  category: UploadCategory,
  ownerId: string
): Promise<{ relPath: string; absPath: string; size: number; mime: string }> {
  const buf = Buffer.from(await file.arrayBuffer());
  const ext = safeExtFromMime(file.type);
  const relPath = makeFilename(category, ownerId, ext);
  const absPath = path.join(LOCAL_STORAGE_DIR, relPath);
  await fs.mkdir(path.dirname(absPath), { recursive: true });
  await fs.writeFile(absPath, buf);
  return { relPath, absPath, size: buf.length, mime: file.type };
}

async function saveVercelBlob(
  file: File,
  category: UploadCategory,
  ownerId: string
): Promise<{ relPath: string; absPath: string; size: number; mime: string }> {
  const { put } = await import("@vercel/blob").catch(() => {
    throw new Error(
      "STORAGE_BACKEND=vercel-blob but @vercel/blob is not installed. Run `npm i @vercel/blob`."
    );
  });
  const ext = safeExtFromMime(file.type);
  const pathname = makeFilename(category, ownerId, ext);
  const blob = await put(pathname, file, {
    access: "public",
    addRandomSuffix: false,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  return { relPath: blob.pathname, absPath: blob.url, size: file.size, mime: file.type };
}

async function saveSupabase(
  file: File,
  category: UploadCategory,
  ownerId: string
): Promise<{ relPath: string; absPath: string; size: number; mime: string }> {
  const { createClient } = await import("@supabase/supabase-js").catch(() => {
    throw new Error(
      "STORAGE_BACKEND=supabase but @supabase/supabase-js is not installed. Run `npm i @supabase/supabase-js`."
    );
  });
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "uploads";
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
  const ext = safeExtFromMime(file.type);
  const objectPath = makeFilename(category, ownerId, ext);
  const buf = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage.from(bucket).upload(objectPath, buf, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw new Error(`Supabase upload failed: ${error.message}`);
  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(objectPath);
  return { relPath: objectPath, absPath: pub.publicUrl, size: buf.length, mime: file.type };
}

export async function saveUpload(
  file: File,
  category: UploadCategory,
  ownerId: string
): Promise<{ relPath: string; absPath: string; size: number; mime: string }> {
  if (!ALLOWED_MIME.has(file.type)) {
    throw new Error(`Unsupported file type: ${file.type}`);
  }
  if (file.size > MAX_BYTES) {
    throw new Error(`File too large (${(file.size / 1024 / 1024).toFixed(2)} MB > 5 MB)`);
  }
  if (STORAGE_BACKEND === "vercel-blob") return saveVercelBlob(file, category, ownerId);
  if (STORAGE_BACKEND === "supabase") return saveSupabase(file, category, ownerId);
  return saveLocal(file, category, ownerId);
}

export async function readUpload(relPath: string): Promise<{ absPath: string; mime: string } | null> {
  if (STORAGE_BACKEND === "vercel-blob" || STORAGE_BACKEND === "supabase") {
    // For cloud backends, callers should resolve the public URL via the
    // stored absPath (or generate a signed URL). The legacy local helper
    // is a no-op for cloud storage.
    return null;
  }
  const safe = relPath.replace(/\.\./g, "").replace(/^\/+/, "");
  const absPath = path.join(LOCAL_STORAGE_DIR, safe);
  if (!absPath.startsWith(LOCAL_STORAGE_DIR)) return null;
  try {
    await fs.access(absPath);
    const ext = path.extname(absPath).toLowerCase();
    const mime =
      ext === ".png" ? "image/png" :
      ext === ".webp" ? "image/webp" :
      "image/jpeg";
    return { absPath, mime };
  } catch {
    return null;
  }
}

export async function resolveUploadUrl(relPath: string): Promise<string | null> {
  // Support legacy rows where a full URL was stored directly.
  if (/^https?:\/\//i.test(relPath)) return relPath;

  if (STORAGE_BACKEND === "vercel-blob") {
    const { head } = await import("@vercel/blob").catch(() => ({ head: null as any }));
    if (!head) return null;
    try {
      const blob = await head(relPath, { token: process.env.BLOB_READ_WRITE_TOKEN });
      return blob.url;
    } catch {
      return null;
    }
  }

  if (STORAGE_BACKEND === "supabase") {
    const { createClient } = await import("@supabase/supabase-js").catch(() => ({ createClient: null as any }));
    if (!createClient || !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return null;
    }
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "uploads";
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false } }
    );
    const { data } = supabase.storage.from(bucket).getPublicUrl(relPath);
    return data?.publicUrl || null;
  }

  return null;
}

export async function deleteUpload(relPath: string): Promise<void> {
  if (STORAGE_BACKEND === "vercel-blob") {
    const { del } = await import("@vercel/blob").catch(() => ({ del: null as any }));
    if (del) await del(relPath, { token: process.env.BLOB_READ_WRITE_TOKEN }).catch(() => {});
    return;
  }
  if (STORAGE_BACKEND === "supabase") {
    const { createClient } = await import("@supabase/supabase-js").catch(() => ({ createClient: null as any }));
    if (createClient) {
      const supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
      );
      const bucket = process.env.SUPABASE_STORAGE_BUCKET || "uploads";
      await supabase.storage.from(bucket).remove([relPath]).catch(() => {});
    }
    return;
  }
  const safe = relPath.replace(/\.\./g, "").replace(/^\/+/, "");
  const absPath = path.join(LOCAL_STORAGE_DIR, safe);
  if (!absPath.startsWith(LOCAL_STORAGE_DIR)) return;
  try {
    await fs.unlink(absPath);
  } catch {
    // ignore
  }
}
