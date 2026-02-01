const DashboardPage = () => {
  return (
    <section>
      <h2>Guild Configuration</h2>
      <div className="card-grid">
        <div className="card">
          <h3>Moderation</h3>
          <p>Toggle automod rules, logging channel, and timeout defaults.</p>
        </div>
        <div className="card">
          <h3>Music</h3>
          <p>Manage Lavalink nodes, DJ roles, and queue limits.</p>
        </div>
        <div className="card">
          <h3>Tickets</h3>
          <p>Define ticket categories and auto-assign support staff.</p>
        </div>
        <div className="card">
          <h3>Welcome Flow</h3>
          <p>Customize onboarding messages and verification prompts.</p>
        </div>
      </div>
    </section>
  );
};

export default DashboardPage;
