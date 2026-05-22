import Link from "next/link";
import { notFound } from "next/navigation";
import { getPhotoBySlug } from "@/lib/photos";

export const dynamic = "force-dynamic";

export default async function PhotoAlbumPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cleanSlug = slug.endsWith(".md") ? slug.slice(0, -3) : slug;
  const photo = await getPhotoBySlug(cleanSlug);

  if (!photo) {
    notFound();
  }

  return (
    <main className="dbx-page">
      {/* Terminal top bar */}
      <header className="dbx-topbar">
        <nav className="dbx-term">
          <span className="dbx-term__ps1">➜&nbsp;</span>
          <Link href="/" className="dbx-term__seg">/home/suzilu</Link>
          <span className="dbx-term__sep">/</span>
          <Link href="/photography" className="dbx-term__seg">photos</Link>
          <span className="dbx-term__sep">/</span>
          <span className="dbx-term__current">{cleanSlug}</span>
          <span className="dbx-term__cursor">&#x2588;</span>
        </nav>
      </header>

      {/* Photo album */}
      <article className="dbx-post">
        <header className="dbx-post__head">
          <div className="dbx-post__date">
            <time>{photo.date}</time>
          </div>
          <h1 className="dbx-post__title">{photo.title}</h1>
        </header>

        {/* Hero image */}
        <div className="dbx-photo-hero">
          <img
            src={photo.thumbnail}
            alt={photo.title}
            className="dbx-photo-hero__img"
          />
        </div>

        <div
          className="dbx-post__body"
          dangerouslySetInnerHTML={{ __html: photo.content }}
        />
      </article>

      {/* Back link */}
      <footer className="dbx-post__footer">
        <Link href="/photography" className="dbx-post__back">
          ← back to photos
        </Link>
      </footer>
    </main>
  );
}
