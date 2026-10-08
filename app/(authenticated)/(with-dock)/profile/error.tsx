"use client";

export default function ProfileError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <section className="home-state-card" role="alert">
      <p className="home-kicker">Profile unavailable</p>
      <h1>Something interrupted the page.</h1>
      <p>Your saved preferences have not been replaced or changed.</p>
      <button className="button button-secondary" onClick={retry} type="button">
        Try again
      </button>
    </section>
  );
}
