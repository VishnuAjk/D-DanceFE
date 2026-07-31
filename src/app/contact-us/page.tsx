import { PublicNav } from '@/components/public-nav';

export default function ContactUsPage() {
  return (
    <main className="public-page">
      <PublicNav />

      <section className="public-page__hero">
        <p className="landing__eyebrow">Contact Us</p>
        <h1>Admissions and batch enquiries.</h1>
        <p>
          Reach out to the studio office for class availability, trial sessions, fee details,
          and enrollment support.
        </p>
      </section>

      <section className="public-page__grid" aria-label="Contact details">
        <article className="public-page__panel">
          <h2>Studio office</h2>
          <p>123 Dance Avenue, Cultural District, Bengaluru, Karnataka 560001</p>
        </article>
        <article className="public-page__panel">
          <h2>Phone</h2>
          <p>+91 98765 43210</p>
        </article>
        <article className="public-page__panel">
          <h2>Email</h2>
          <p>hello@thedancestudio.example</p>
        </article>
        <article className="public-page__panel">
          <h2>Office hours</h2>
          <p>Monday to Saturday, 10:00 AM to 7:00 PM</p>
        </article>
      </section>
    </main>
  );
}
