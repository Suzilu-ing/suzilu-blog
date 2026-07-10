import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/posts";

export const dynamic = "force-dynamic";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // Strip .md suffix if accidentally included in URL
  const cleanSlug = slug.endsWith(".md") ? slug.slice(0, -3) : slug;
  const post = await getPostBySlug(cleanSlug);

  if (!post) {
    notFound();
  }

  return (
    <main className="dbx-page">
      {/* Terminal top bar */}
      <header className="dbx-topbar">
        <nav className="dbx-term" aria-label="Breadcrumb">
          <span className="dbx-term__ps1">➜&nbsp;</span>
          <Link href="/" className="dbx-term__seg" aria-label="Home">
            <span className="dbx-term__root-full" aria-hidden="true">/home/suzilu</span>
            <span className="dbx-term__root-short" aria-hidden="true">~</span>
          </Link>
          <span className="dbx-term__sep">/</span>
          <Link href="/blog" className="dbx-term__seg">writing</Link>
          <span className="dbx-term__sep">/</span>
          <span className="dbx-term__current dbx-term__filename">{cleanSlug}</span>
          <span className="dbx-term__current">.md</span>
          <span className="dbx-term__cursor">&#x2588;</span>
        </nav>
      </header>

      {/* Post header */}
      <article className="dbx-post">
        <header className="dbx-post__head">
          <div className="dbx-post__date">
            <time>{post.date}</time>
          </div>
          <h1 className="dbx-post__title">{post.title}</h1>
        </header>

        <div
          className="dbx-post__body"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>

      {/* Back link */}
      <footer className="dbx-post__footer">
        <Link href="/blog" className="dbx-post__back">
          ← back to writing
        </Link>
      </footer>
    </main>
  );
}
