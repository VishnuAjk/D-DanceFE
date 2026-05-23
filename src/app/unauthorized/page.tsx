import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <main className="status-screen">
      <section className="status-card">
        <p className="status-card__eyebrow">Access unavailable</p>
        <h1 className="status-card__title">You do not have access to this area.</h1>
        <p className="status-card__text">
          This page is for a different account type. Return to your dashboard to continue.
        </p>
        <Link className="button button--primary" href="/dashboard-redirect">
          Go to my dashboard
        </Link>
      </section>
    </main>
  );
}
