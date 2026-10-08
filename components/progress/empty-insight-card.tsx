type EmptyInsightCardProps = {
  description: string;
  eyebrow: string;
  title: string;
};

export function EmptyInsightCard({
  description,
  eyebrow,
  title,
}: EmptyInsightCardProps) {
  return (
    <article className="progress-empty-card">
      <span className="progress-empty-symbol" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M5 19V9M12 19V5M19 19v-6" />
        </svg>
      </span>
      <div>
        <p className="home-kicker">{eyebrow}</p>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <span className="status-pill">Waiting for practice data</span>
    </article>
  );
}
