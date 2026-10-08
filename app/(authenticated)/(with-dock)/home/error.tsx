"use client";

export default function HomeError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <section className="home-state-card" role="alert">
      <p className="home-kicker">Home unavailable</p>
      <h1>Something interrupted the page.</h1>
      <p>Your learning metrics have not been replaced with placeholder data.</p>
      <button className="button button-secondary" onClick={retry} type="button">
        Try again
      </button>
    </section>
  );
}
