export default function GeneratorPage() {
  return (
    <section className="page">
      <div className="page-header">
        <h1 className="page-title">Generator</h1>
        <p className="page-description">
          Page Object code generation and preview will be implemented in Phase
          6.
        </p>
      </div>

      <section className="panel">
        <div className="panel__header">
          <div className="panel__title">Generated Artifacts</div>
        </div>
        <div className="empty-state">No generated artifacts are available yet.</div>
      </section>
    </section>
  );
}
