export default function HomeLoading() {
  return (
    <div className="home-loading" role="status" aria-label="Loading Home">
      <span className="sr-only">Loading Home</span>
      <div className="home-loading-hero" />
      <div className="home-loading-row" />
      <div className="home-loading-grid">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
