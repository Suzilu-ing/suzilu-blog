import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const photosDirectory = path.join(process.cwd(), "content/photography");

/**
 * Normalize a slug: trim, replace whitespace with hyphens, lowercase.
 */
function normalizeSlug(slug: string): string {
  return slug.trim().replace(/\s+/g, "-").toLowerCase();
}

/**
 * Get a frontmatter field case-insensitively.
 */
function getField(data: Record<string, unknown>, key: string): string {
  const lowerKey = key.toLowerCase();
  for (const [k, v] of Object.entries(data)) {
    if (k.toLowerCase() === lowerKey && typeof v === "string") return v;
  }
  return "";
}

export interface Photo {
  slug: string;
  title: string;
  date: string;
  thumbnail: string;
  content: string;
}

export interface PhotoMeta {
  slug: string;
  title: string;
  date: string;
  thumbnail: string;
}

/**
 * Get all photos sorted by date (newest first).
 */
export function getAllPhotos(): PhotoMeta[] {
  if (!fs.existsSync(photosDirectory)) return [];

  const fileNames = fs.readdirSync(photosDirectory);

  const photos = fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      const filenameSlug = fileName.replace(/\.md$/, "");
      const fullPath = path.join(photosDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data } = matter(fileContents);

      return {
        slug: normalizeSlug(getField(data, "slug") || filenameSlug),
        title: getField(data, "title"),
        date: getField(data, "date"),
        thumbnail: getField(data, "thumbnail") || `/photos/${filenameSlug}.jpg`,
      };
    });

  return photos.sort((a, b) => (a.date < b.date ? 1 : -1));
}

/**
 * Get a single photo album by slug with HTML content.
 */
export async function getPhotoBySlug(slug: string): Promise<Photo | null> {
  if (!fs.existsSync(photosDirectory)) return null;

  const normalizedSlug = normalizeSlug(slug);

  // First try: direct filename match
  let fullPath = path.join(photosDirectory, `${normalizedSlug}.md`);

  if (!fs.existsSync(fullPath)) {
    // Second try: search frontmatter slugs
    const fileNames = fs.readdirSync(photosDirectory).filter((f) => f.endsWith(".md"));
    let found = false;
    for (const fileName of fileNames) {
      const fileContents = fs.readFileSync(path.join(photosDirectory, fileName), "utf8");
      const { data } = matter(fileContents);
      if (normalizeSlug(getField(data, "slug") || "") === normalizedSlug) {
        fullPath = path.join(photosDirectory, fileName);
        found = true;
        break;
      }
    }
    if (!found) return null;
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  const processedContent = await remark().use(html).process(content);
  const contentHtml = processedContent.toString();

  return {
    slug: normalizedSlug,
    title: getField(data, "title"),
    date: getField(data, "date"),
    thumbnail: getField(data, "thumbnail") || `/photos/${normalizedSlug}.jpg`,
    content: contentHtml,
  };
}
