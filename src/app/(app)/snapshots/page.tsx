export default function SnapshotsPage() {
  return (
    <section className="page">
      <div className="page-header">
        <h1 className="page-title">Snapshots</h1>
        <p className="page-description">
          Crawled page snapshots and DOM parsing entry points will be
          implemented in Phases 3 and 4.
        </p>
      </div>

      <section className="panel">
        <div className="panel__header">
          <div className="panel__title">Captured Pages</div>
        </div>
        <div className="empty-state">No snapshots have been captured yet.</div>
      </section>
    </section>
  );
}
