import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <main className="dbx-page">
      <header className="dbx-topbar">
        <nav className="dbx-term">
          <span className="dbx-term__ps1">➜ </span>
          <Link href="/" className="dbx-term__seg">/home/suzilu</Link>
          <span className="dbx-term__sep">/</span>
          <span className="dbx-term__current">writing</span>
          <span className="dbx-term__cursor">&#x2588;</span>
        </nav>
      </header>

      <header className="dbx-article-head">
        <h1 className="dbx-article-head__title">writing</h1>
      </header>

      <section className="dbx-section">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="dbx-row"
          >
            <span className="dbx-row__lead">{post.date}</span>
            <span className="dbx-row__title">{post.title}</span>
            <span className="dbx-row__arrow">&rarr;</span>
          </Link>
        ))}
      </section>
    </main>
  );
}
