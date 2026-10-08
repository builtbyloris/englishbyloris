import { StreakCard } from "@/components/home/streak-card";
import { XPIndicator } from "@/components/home/xp-indicator";
import { gameCatalog } from "@/lib/games/catalog";

import { EmptyInsightCard } from "./empty-insight-card";

type ProgressExperienceProps = {
  currentStreak: number | null;
  xp: number | null;
};

const unavailableMetrics = [
  {
    label: "Games played",
    description: "Available after completed game sessions are tracked.",
  },
  {
    label: "Overall accuracy",
    description: "Calculated only from answers recorded during practice.",
  },
] as const;

export function ProgressExperience({
  currentStreak,
  xp,
}: ProgressExperienceProps) {
  return (
    <div className="progress-page">
      <header className="progress-header">
        <div>
          <p className="home-kicker">Learning journey</p>
          <h1>Progress</h1>
          <p>
            A focused view of the practice you complete and the skills you build
            over time.
          </p>
        </div>
        <div className="progress-header-note">
          <span aria-hidden="true" />
          <p>
            Insights will become more detailed as completed practice is safely
            recorded.
          </p>
        </div>
      </header>

      <section className="progress-section" aria-labelledby="progress-overview">
        <div className="progress-section-heading">
          <div>
            <p className="home-kicker">Overview</p>
            <h2 id="progress-overview">Your learning at a glance</h2>
          </div>
          <p>Only metrics currently available in your profile are shown.</p>
        </div>

        <div className="progress-overview-grid">
          <div className="progress-real-metrics">
            <XPIndicator value={xp} />
            <StreakCard value={currentStreak} />
          </div>
          <div className="progress-pending-metrics">
            {unavailableMetrics.map((metric) => (
              <article className="progress-pending-metric" key={metric.label}>
                <div>
                  <p>{metric.label}</p>
                  <strong>Not tracked yet</strong>
                </div>
                <span>{metric.description}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="progress-section"
        aria-labelledby="performance-heading"
      >
        <div className="progress-section-heading">
          <div>
            <p className="home-kicker">Performance</p>
            <h2 id="performance-heading">By game and skill</h2>
          </div>
          <p>No scores or percentages are shown until real sessions exist.</p>
        </div>

        <div className="progress-performance-card">
          <div className="progress-performance-intro">
            <span className="progress-performance-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M4 18.5 9 13l3.5 3.5L20 7.5" />
                <path d="M15 7.5h5v5" />
              </svg>
            </span>
            <div>
              <h3>Performance will appear here</h3>
              <p>
                Completed sessions will eventually reveal useful patterns by
                game and skill, without turning this page into a dense dashboard.
              </p>
            </div>
          </div>

          <ul className="progress-game-list">
            {gameCatalog.map((game) => (
              <li data-game={game.slug} key={game.slug}>
                <span aria-hidden="true" />
                <div>
                  <strong>{game.title}</strong>
                  <small>{game.category}</small>
                </div>
                <p>Awaiting completed sessions</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="progress-section" aria-labelledby="insights-heading">
        <div className="progress-section-heading">
          <div>
            <p className="home-kicker">Insights</p>
            <h2 id="insights-heading">What your practice reveals</h2>
          </div>
          <p>Insights will be based on recorded answers, never assumptions.</p>
        </div>

        <div className="progress-insights-grid">
          <EmptyInsightCard
            description="Consistent high performance will surface the skills you handle with confidence."
            eyebrow="Strengths"
            title="Strongest Areas"
          />
          <EmptyInsightCard
            description="Concepts that need more support will appear only after enough real answers are available."
            eyebrow="Focus"
            title="Weak Areas"
          />
        </div>
      </section>

      <section className="progress-mistakes-card" aria-labelledby="mistakes-heading">
        <div className="progress-mistakes-copy">
          <p className="home-kicker">Review</p>
          <h2 id="mistakes-heading">My Mistakes</h2>
          <p>
            When mistake review is implemented, this space will help you revisit
            concepts using fresh examples instead of repeating the same sentence.
          </p>
        </div>
        <div className="progress-mistakes-state">
          <span aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M7 4.5h10a2 2 0 0 1 2 2v13H7a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2Z" />
              <path d="M9 9h6M9 13h4" />
            </svg>
          </span>
          <div>
            <strong>No review data yet</strong>
            <p>Mistakes will appear only after question history is recorded.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
