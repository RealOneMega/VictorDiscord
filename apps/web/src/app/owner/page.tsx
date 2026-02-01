const OwnerConsolePage = () => {
  return (
    <section className="card">
      <h2>Owner Console</h2>
      <p>This area is restricted to the bot owner and shows live data from the bot.</p>
      <ul>
        <li>Guild list with premium status and enabled modules.</li>
        <li>Channel, role, and member visibility based on bot permissions.</li>
        <li>On-demand message fetch with strict rate limits.</li>
      </ul>
      <p>Data shown is limited to what the bot can access with its permissions.</p>
      <p>Actions are audited and may be disabled by global kill switch.</p>
    </section>
  );
};

export default OwnerConsolePage;
