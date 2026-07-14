import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import { getAllPhotos } from "@/lib/photos";

export default function Home() {
  const posts = getAllPosts();
  const photos = getAllPhotos().slice(0, 4);

  return (
    <main className="dbx-page">
      {/* Terminal top bar */}
      <header className="dbx-topbar">
        <nav className="dbx-term">
          <span className="dbx-term__ps1">➜&nbsp;</span>
          <span className="dbx-term__current">/home/suzilu</span>
          <span className="dbx-term__cursor">&#x2588;</span>
        </nav>
      </header>

      {/* Hero */}
      <section className="dbx-hero">
        <h1 className="dbx-hero__name">
          <span className="dbx-hero__line">
            Suzilu
            <span className="dbx-hero__dot dbx-hero__dot--1">.</span>
            <span className="dbx-hero__dot dbx-hero__dot--2">.</span>
            <span className="dbx-hero__dot dbx-hero__dot--3">.</span>
          </span>
        </h1>
        <p className="dbx-hero__tag">
          坚持长期主义，希望能把博客一直进行下去。
        </p>
      </section>

      {/* Social links */}
      <nav className="dbx-hero__socials">
        <a href="https://github.com/Suzilu-ing" target="_blank" rel="noreferrer">
          github
        </a>
        <a href="mailto:1467468313@qq.com">email</a>

      </nav>

      {/* Writing section */}
      <section className="dbx-section">
        <header className="dbx-section-head">
          <Link href="/blog" className="dbx-section-head__name">Writing</Link>
          <span className="dbx-section-head__line" />
        </header>
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

      {/* Photos section */}
      <section className="dbx-section">
        <header className="dbx-section-head">
          <Link href="/photography" className="dbx-section-head__name">Photos</Link>
          <span className="dbx-section-head__line" />
        </header>
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
