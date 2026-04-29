import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="landing">
      <section className="landing__panel">
        <p className="landing__eyebrow">Dance Institute Platform</p>
        <h1 className="landing__title">Mobile-first operations for dance institutes.</h1>
        <p className="landing__lede">
          The frontend shell is now ready for role-aware auth flows, protected routes, and
          dashboard expansion across parents, instructors, and administrators.
        </p>

        <div className="landing__actions">
          <Link className="button button--primary" href="/login">
            Continue to login
          </Link>
          <Link className="button button--ghost" href="/parent">
            View protected shell
          </Link>
        </div>
      </section>
    </main>
  );
}
