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

function normalizeImageUrl(src: string): string {
  try {
    const url = new URL(src, "https://local.invalid");
    url.pathname = url.pathname.replace(/\/{2,}/g, "/");
    return url.host === "local.invalid"
      ? url.pathname
      : `${url.protocol}//${url.host}${url.pathname}`;
  } catch {
    return src.replace(/([^:])\/{2,}/g, "$1/");
  }
}

function extractLeadingDuplicateThumbnail(
  contentHtml: string,
  thumbnail: string,
): { contentHtml: string; captionHtml: string } {
  const extractLeadingCaption = (htmlContent: string) => {
    const leadingCaptionPattern =
      /^(?:<p>\s*)?(<small>[\s\S]*?<\/small>)\s*(?:<\/p>)?/i;
    const captionMatch = htmlContent.match(leadingCaptionPattern);

    if (!captionMatch) {
      return { contentHtml: htmlContent, captionHtml: "" };
    }

    return {
      contentHtml: htmlContent.slice(captionMatch[0].length).trimStart(),
      captionHtml: captionMatch[1],
    };
  };

  const leadingImagePattern =
    /^\s*(?:<p>\s*)?<img\s+[^>]*src="([^"]+)"[^>]*>\s*(?:<\/p>)?/i;
  const match = contentHtml.match(leadingImagePattern);

  if (!match) return extractLeadingCaption(contentHtml);

  const [, imageSrc] = match;
  if (normalizeImageUrl(imageSrc) !== normalizeImageUrl(thumbnail)) {
    return { contentHtml, captionHtml: "" };
  }

  const nextContent = contentHtml.slice(match[0].length).trimStart();
  const caption = extractLeadingCaption(nextContent);

  return caption.captionHtml
    ? caption
    : { contentHtml: nextContent, captionHtml: "" };
}

function wrapImageCaptions(contentHtml: string): string {
  return contentHtml
    .replace(
      /<p>\s*(<img\b[^>]*>)\s*<\/p>\s*<p>\s*(<small>[\s\S]*?<\/small>)\s*<\/p>/gi,
      '<figure class="dbx-photo-figure">$1$2</figure>',
    )
    .replace(
      /(<img\b[^>]*>)\s*(<small>[\s\S]*?<\/small>)/gi,
      '<figure class="dbx-photo-figure">$1$2</figure>',
    );
}

function getCaption(content: string): string {
  const match = content.match(/<small>([\s\S]*?)<\/small>/i);
  if (!match) return "";

  return match[1]
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export interface Photo {
  slug: string;
  title: string;
  date: string;
  thumbnail: string;
  captionHtml: string;
  content: string;
}

export interface PhotoMeta {
  slug: string;
  title: string;
  date: string;
  thumbnail: string;
  excerpt: string;
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
      const { data, content } = matter(fileContents);

      return {
        slug: normalizeSlug(getField(data, "slug") || filenameSlug),
        title: getField(data, "title"),
        date: getField(data, "date"),
        thumbnail: getField(data, "thumbnail") || `/photos/${filenameSlug}.jpg`,
        excerpt: getCaption(content),
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
  const thumbnail = getField(data, "thumbnail") || `/photos/${normalizedSlug}.jpg`;

  const processedContent = await remark().use(html, { sanitize: false }).process(content);
  const extracted = extractLeadingDuplicateThumbnail(
    processedContent.toString(),
    thumbnail,
  );
  const contentHtml = wrapImageCaptions(extracted.contentHtml);

  return {
    slug: normalizedSlug,
    title: getField(data, "title"),
    date: getField(data, "date"),
    thumbnail,
    captionHtml: extracted.captionHtml,
    content: contentHtml,
  };
}
