import Link from 'next/link';

const HomePage = () => {
  return (
    <section className="card">
      <h1>Victor Discord Suite</h1>
      <p>
        Manage premium automations, music, polls, and moderation from a single lightweight
        dashboard.
      </p>
      <Link href="/dashboard">
        <button type="button">Open Dashboard</button>
      </Link>
    </section>
  );
};

export default HomePage;
