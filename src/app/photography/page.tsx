import Link from "next/link";
import { getAllPhotos } from "@/lib/photos";

export default function PhotographyPage() {
  const photos = getAllPhotos();
  return (
    <main className="dbx-page">
      <header className="dbx-topbar">
        <nav className="dbx-term">
          <span className="dbx-term__ps1">{"➜ "}</span>
          <Link href="/" className="dbx-term__seg">/home/suzilu</Link>
          <span className="dbx-term__sep">/</span>
          <span className="dbx-term__current">photos</span>
          <span className="dbx-term__cursor">&#x2588;</span>
        </nav>
      </header>

      <header className="dbx-article-head">
        <h1 className="dbx-article-head__title">photos</h1>
      </header>

      <section className="dbx-section">
        <div className="dbx-photo-grid">
          {photos.map((photo) => (
            <Link
              key={photo.slug}
              href={`/photography/${photo.slug}`}
              className="dbx-photo-card"
            >
              <div className="dbx-photo-card__img-wrap">
                <img
                  src={photo.thumbnail}
                  alt={photo.title}
                  className="dbx-photo-card__img"
                  loading="lazy"
                />
              </div>
              <div className="dbx-photo-card__info">
                <div className="dbx-photo-card__meta">
                  <span className="dbx-photo-card__title">{photo.title}</span>
                  <span className="dbx-photo-card__date">{photo.date}</span>
                </div>
                {photo.excerpt ? (
                  <p className="dbx-photo-card__excerpt">{photo.excerpt}</p>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
