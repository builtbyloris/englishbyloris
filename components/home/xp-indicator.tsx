type XPIndicatorProps = {
  value: number | null;
};

const numberFormatter = new Intl.NumberFormat("en-US");

export function XPIndicator({ value }: XPIndicatorProps) {
  return (
    <article className="home-metric-card">
      <span className="home-metric-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="m12 3 2.75 5.57 6.15.9-4.45 4.33 1.05 6.12L12 17.03l-5.5 2.89 1.05-6.12L3.1 9.47l6.15-.9L12 3Z" />
        </svg>
      </span>
      <div>
        <p className="home-metric-label">Total XP</p>
        <p className="home-metric-value">
          {value === null ? "Unavailable" : numberFormatter.format(value)}
        </p>
      </div>
    </article>
  );
}
