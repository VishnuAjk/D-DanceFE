import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="landing">
      <nav className="landing__nav" aria-label="Main navigation">
        <Link className="landing__nav-link is-active" href="/">
          Home
        </Link>
        <Link className="landing__nav-link" href="/about-us">
          About us
        </Link>
        <Link className="landing__nav-link" href="/contact-us">
          Contact us
        </Link>
        <Link className="landing__nav-link landing__nav-link--cta" href="/login">
          Sign in
        </Link>
      </nav>

      <section className="landing__hero" aria-labelledby="home-title">
        <div className="landing__copy">
          <p className="landing__eyebrow">Welcome to</p>
          <div className="landing__brand-card" aria-label="The Dance Studio">
            <span className="landing__brand-kicker">The</span>
            <h1 id="home-title" className="landing__brand-title">
              Dance Studio
            </h1>
            <div className="landing__dancers" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>
            <span className="landing__brand-line" />
          </div>
          <p className="landing__lede">
            Grace, discipline, and joyful movement for every age group. Join a studio where
            students learn with care, families stay connected, and every performance begins
            with confidence.
          </p>

          <div className="landing__actions">
            <Link className="button button--primary" href="/login">
              Sign in
            </Link>
          </div>

        </div>

        <aside className="landing__info" aria-label="About The Dance Studio">
          <p className="landing__info-label">Est. 1983</p>
          <h2>Classical, contemporary, and creative dance training.</h2>
          <p>
            Structured classes, experienced instructors, and a welcoming environment for
            beginners, growing performers, and dedicated dance families.
          </p>
          <div className="landing__info-grid">
            <span>Kids batches</span>
            <span>Adult classes</span>
            <span>Stage practice</span>
            <span>Progress reviews</span>
          </div>
        </aside>
      </section>

      <section className="landing__contact" aria-label="Contact information">
        <span>Visit the studio office for admissions and batch availability.</span>
        <Link href="/login">Continue to account</Link>
      </section>
    </main>
  );
}
