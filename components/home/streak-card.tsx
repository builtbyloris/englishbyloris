type StreakCardProps = {
  value: number | null;
};

export function StreakCard({ value }: StreakCardProps) {
  const formattedValue =
    value === null ? "Unavailable" : `${value} ${value === 1 ? "day" : "days"}`;

  return (
    <article className="home-metric-card">
      <span className="home-metric-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M13.5 2.75c.6 3.95-2.18 5.13-3.2 7.33-.72 1.56-.3 2.82.76 3.75-.03-2.03 1.3-3.29 2.7-4.47.28 2.62 2.74 3.86 2.74 6.74a4.5 4.5 0 0 1-9 0c0-2.34 1.25-4.3 3.04-5.93 2.4-2.18 3.06-4.18 2.96-7.42Z" />
        </svg>
      </span>
      <div>
        <p className="home-metric-label">Current streak</p>
        <p className="home-metric-value">{formattedValue}</p>
      </div>
    </article>
  );
}
