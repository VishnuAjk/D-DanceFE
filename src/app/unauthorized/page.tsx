import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <main className="status-screen">
      <section className="status-card">
        <p className="status-card__eyebrow">Unauthorized</p>
        <h1 className="status-card__title">You do not have access to this area.</h1>
        <p className="status-card__text">
          Your session is valid, but the current route does not match your assigned role.
        </p>
        <Link className="button button--primary" href="/dashboard-redirect">
          Go to my dashboard
        </Link>
      </section>
    </main>
  );
}
