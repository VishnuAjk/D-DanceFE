import Link from 'next/link';
import { PublicNav } from '@/components/public-nav';

export default function HomePage() {
  return (
    <main className="landing">
      <PublicNav />

      <section className="landing__hero" aria-labelledby="home-title">
        <div className="landing__copy">
          <p className="landing__eyebrow landing__eyebrow--pill">Dance • Learn • Perform</p>
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
            Thoughtful dance training for every age, with simple class, fee, and progress updates for families.
          </p>

          <div className="landing__actions">
            <Link className="button button--primary" href="/login">
              Join or sign in
            </Link>
            <Link className="button button--ghost" href="/about-us">
              Explore the studio
            </Link>
          </div>
          <div className="landing__trust" aria-label="Studio highlights">
            <span><strong>40+</strong> years teaching</span>
            <span><strong>All ages</strong> welcomed</span>
            <span><strong>1 hub</strong> for families</span>
          </div>
        </div>

        <aside className="landing__info" aria-label="About The Dance Studio">
          <p className="landing__info-label">Est. 1983</p>
          <h2>Find your rhythm. Build your confidence.</h2>
          <p>
            Structured classes, experienced instructors, and a welcoming environment for
            beginners, growing performers, and dedicated dance families.
          </p>
          <div className="landing__info-grid" aria-label="Available programs">
            <span><b aria-hidden="true">01</b> Kids batches</span>
            <span><b aria-hidden="true">02</b> Adult classes</span>
            <span><b aria-hidden="true">03</b> Stage practice</span>
            <span><b aria-hidden="true">04</b> Progress reviews</span>
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
