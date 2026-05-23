import Link from 'next/link';

export default function AboutUsPage() {
  return (
    <main className="public-page">
      <nav className="landing__nav" aria-label="Main navigation">
        <Link className="landing__nav-link" href="/">
          Home
        </Link>
        <Link className="landing__nav-link is-active" href="/about-us">
          About us
        </Link>
        <Link className="landing__nav-link" href="/contact-us">
          Contact us
        </Link>
        <Link className="landing__nav-link landing__nav-link--cta" href="/login">
          Sign in
        </Link>
      </nav>

      <section className="public-page__hero">
        <p className="landing__eyebrow">About The Dance Studio</p>
        <h1>Where discipline meets expression.</h1>
        <p>
          The Dance Studio is a place for students to discover rhythm, posture, confidence,
          and stage presence through guided dance training.
        </p>
      </section>

      <section className="public-page__grid" aria-label="Studio values">
        <article className="public-page__panel">
          <h2>Thoughtful training</h2>
          <p>
            Classes are planned to help students build strong foundations, improve technique,
            and enjoy the process of learning movement step by step.
          </p>
        </article>
        <article className="public-page__panel">
          <h2>Performance confidence</h2>
          <p>
            From regular practice to stage preparation, students are encouraged to perform with
            clarity, expression, and respect for the art form.
          </p>
        </article>
        <article className="public-page__panel">
          <h2>Family connection</h2>
          <p>
            Families stay involved through class updates, progress tracking, and a simple account
            experience built around the student journey.
          </p>
        </article>
      </section>
    </main>
  );
}
