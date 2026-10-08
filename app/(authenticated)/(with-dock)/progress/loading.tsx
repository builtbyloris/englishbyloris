export default function ProgressLoading() {
  return (
    <div
      className="progress-loading"
      role="status"
      aria-label="Loading Progress"
    >
      <span className="sr-only">Loading Progress</span>
      <div className="progress-loading-header" />
      <div className="progress-loading-metrics">
        <span />
        <span />
      </div>
      <div className="progress-loading-panel" />
      <div className="progress-loading-grid">
        <span />
        <span />
      </div>
    </div>
  );
}
