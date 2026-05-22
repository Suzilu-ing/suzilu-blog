import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const postsDirectory = path.join(process.cwd(), "content/blog");

/**
 * Normalize a slug: trim, replace whitespace with hyphens, lowercase.
 * "My Blog Post" → "my-blog-post"
 */
function normalizeSlug(slug: string): string {
  return slug.trim().replace(/\s+/g, "-").toLowerCase();
}

/**
 * Get a frontmatter field case-insensitively.
 * Accepts "title", "Title", "TITLE", etc.
 */
function getField(data: Record<string, unknown>, key: string): string {
  const lowerKey = key.toLowerCase();
  for (const [k, v] of Object.entries(data)) {
    if (k.toLowerCase() === lowerKey && typeof v === "string") return v;
  }
  return "";
}

export interface Post {
  slug: string;
  title: string;
  date: string;
  content: string;
}

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
}

/**
 * Get all posts sorted by date (newest first).
 * Returns only metadata (no HTML content) — used for list pages.
 */
export function getAllPosts(): PostMeta[] {
  const fileNames = fs.readdirSync(postsDirectory);

  const posts = fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      const filenameSlug = fileName.replace(/\.md$/, "");
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data } = matter(fileContents);

      return {
        slug: normalizeSlug(getField(data, "slug") || filenameSlug),
        title: getField(data, "title"),
        date: getField(data, "date"),
      };
    });

  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

/**
 * Get a single post by slug with HTML content.
 * Slug can be either the frontmatter `slug` field or the filename (without .md).
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const normalizedSlug = normalizeSlug(slug);

  // First try: direct filename match
  let fullPath = path.join(postsDirectory, `${normalizedSlug}.md`);

  if (!fs.existsSync(fullPath)) {
    // Second try: search through all .md files for matching frontmatter slug
    const fileNames = fs.readdirSync(postsDirectory).filter((f) => f.endsWith(".md"));
    let found = false;
    for (const fileName of fileNames) {
      const fileContents = fs.readFileSync(path.join(postsDirectory, fileName), "utf8");
      const { data } = matter(fileContents);
      if (normalizeSlug(getField(data, "slug") || "") === normalizedSlug) {
        fullPath = path.join(postsDirectory, fileName);
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
    content: contentHtml,
  };
}
