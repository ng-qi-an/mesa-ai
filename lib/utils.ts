import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const allowedMimeTypes = ["text/html", "text/css", "text/plain", "text/xml", "text/csv", "text/rtf", "text/javascript", "application/json", "application/pdf", "image/bmp", "image/jpeg", "image/png", "image/webp"]

export function mimeToReadable(mime: string) {
  if (mime === "application/x-directory") return "Folder";
  if (!allowedMimeTypes.includes(mime)) return "Unknown";
  if (mime === "application/pdf") return "PDF Document";
  if (mime === "text/plain") return "Text Document";
  const parts = mime.split("/");
  if (parts.length < 2) return mime;
  if (parts[0] === "image") return parts[1].toUpperCase() + " Image";
  if (parts[0] === "text" || parts[0] === 'application') return parts[1].toUpperCase() + " File";
}