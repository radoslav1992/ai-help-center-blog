import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

const mimeToExtension: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/svg+xml": ".svg"
};

const allowedExtensions = new Set(Object.values(mimeToExtension));

function extensionFromFile(file: File) {
  const mimeExtension = mimeToExtension[file.type];

  if (mimeExtension) {
    return mimeExtension;
  }

  const fileExtension = path.extname(file.name).toLowerCase();
  if (allowedExtensions.has(fileExtension)) {
    return fileExtension;
  }

  return null;
}

function sanitizeName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48);
}

export function getImageFile(entry: FormDataEntryValue | null) {
  if (!entry || typeof entry === "string") {
    return null;
  }

  if (entry.size <= 0) {
    return null;
  }

  return entry;
}

export function getImageFiles(entries: FormDataEntryValue[]) {
  return entries
    .filter((entry): entry is File => typeof entry !== "string")
    .filter((file) => file.size > 0);
}

export async function saveImageFile(file: File, folder: string) {
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Image is too large.");
  }

  const extension = extensionFromFile(file);
  if (!extension) {
    throw new Error("Unsupported image format.");
  }

  const filename = `${Date.now()}-${sanitizeName(path.parse(file.name).name) || "image"}-${randomUUID()}${extension}`;
  const relativeDirectory = path.join("uploads", folder);
  const absoluteDirectory = path.join(process.cwd(), "public", relativeDirectory);

  await mkdir(absoluteDirectory, { recursive: true });

  const filePath = path.join(absoluteDirectory, filename);
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(filePath, buffer);

  return `/${path.posix.join("uploads", folder, filename)}`;
}

export async function saveImageFiles(files: File[], folder: string) {
  const results: string[] = [];

  for (const file of files) {
    const saved = await saveImageFile(file, folder);
    results.push(saved);
  }

  return results;
}
