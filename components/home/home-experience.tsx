import type { CefrLevel } from "@/lib/onboarding/validation";

import { GameCard } from "./game-card";
import { StreakCard } from "./streak-card";
import { XPIndicator } from "./xp-indicator";

const levelDescriptions: Record<CefrLevel, string> = {
  A1: "Beginner",
  A2: "Elementary",
  B1: "Intermediate",
  B2: "Upper Intermediate",
};

export type HomeProfile = {
  currentStreak: number | null;
  displayName: string | null;
  englishLevel: CefrLevel | null;
  xp: number | null;
};

function getFirstName(displayName: string | null) {
  return displayName?.trim().split(/\s+/)[0] || null;
}

export function HomeExperience({ profile }: { profile: HomeProfile }) {
  const firstName = getFirstName(profile.displayName);
  const levelDescription = profile.englishLevel
    ? levelDescriptions[profile.englishLevel]
    : null;

  return (
    <div className="home-page">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-intro">
          <p className="home-kicker">Your English space</p>
          <h1 id="home-title">
            Welcome back{firstName ? `, ${firstName}` : ""}
          </h1>
          <div className="home-level" aria-label="Current English level">
            {profile.englishLevel && levelDescription ? (
              <>
                <strong>{profile.englishLevel}</strong>
                <span aria-hidden="true">·</span>
                <span>{levelDescription}</span>
              </>
            ) : (
              <span>Level unavailable</span>
            )}
          </div>
        </div>
        <div className="home-metrics" aria-label="Practice metrics">
          <XPIndicator value={profile.xp} />
          <StreakCard value={profile.currentStreak} />
        </div>
      </section>

      <section className="home-section" aria-labelledby="daily-title">
        <div className="daily-challenge-card">
          <div className="daily-challenge-copy">
            <p className="home-kicker">Daily challenge</p>
            <h2 id="daily-title">A focused mix for your level</h2>
            <p>
              10 mixed questions across vocabulary, verbs and adjectives.
            </p>
            <p className="availability-note" role="status">
              The Daily Challenge is not available yet.
            </p>
          </div>
          <div className="daily-challenge-side">
            <div className="question-dots" aria-hidden="true">
              {Array.from({ length: 10 }, (_, index) => (
                <span key={index} />
              ))}
            </div>
            <button className="button button-primary" type="button" disabled>
              Coming soon
            </button>
          </div>
        </div>
      </section>

      <section className="home-section" aria-labelledby="games-title">
        <div className="home-section-heading">
          <div>
            <p className="home-kicker">Choose your focus</p>
            <h2 id="games-title">Your Games</h2>
          </div>
          <p>Three short ways to practise with purpose.</p>
        </div>
        <div className="games-grid">
          <GameCard
            category="Vocabulary"
            description="Build quick recognition and choose words in context."
            game="word-rush"
            metadata="10 questions · 2–3 min"
            title="Word Rush"
          />
          <GameCard
            category="Grammar in context"
            description="Strengthen verb forms and make confident tense choices."
            game="verb-challenge"
            metadata="10 questions · 3–4 min"
            title="Verb Challenge"
          />
          <GameCard
            category="Adjectives"
            description="Use precise descriptions, opposites and nuanced choices."
            game="describe-it"
            metadata="10 questions · 2–3 min"
            title="Describe It"
          />
        </div>
      </section>

      <section className="home-section" aria-labelledby="practice-title">
        <div className="keep-practicing-card">
          <div>
            <p className="home-kicker">Keep practicing</p>
            <h2 id="practice-title">Your next focus will appear here</h2>
          </div>
          <p>
            Recommendations will become available when there is enough real
            practice history to identify a useful next step.
          </p>
          <span className="status-pill">Awaiting practice data</span>
        </div>
      </section>
    </div>
  );
}
