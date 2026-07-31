import { PublicNav } from '@/components/public-nav';

export default function AboutUsPage() {
  return (
    <main className="public-page">
      <PublicNav />

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
