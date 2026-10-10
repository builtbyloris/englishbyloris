import Link from "next/link";

import type { GameDefinition } from "@/lib/games/catalog";

import styles from "./game-flow.module.css";

type GameResultsProps = {
  bestStreak: number;
  correctCount: number;
  game: GameDefinition;
  onPlayAgain: () => void;
  totalQuestions: number;
};

export function GameResults({
  bestStreak,
  correctCount,
  game,
  onPlayAgain,
  totalQuestions,
}: GameResultsProps) {
  const accuracy = Math.round((correctCount / totalQuestions) * 100);

  return (
    <section className={styles.results} aria-labelledby="demo-results-title">
      <div className={styles.resultsHero}>
        <span className={styles.demoBadge}>Demo complete</span>
        <p className={styles.eyebrow}>{game.title}</p>
        <h1 id="demo-results-title" tabIndex={-1}>
          Session results
        </h1>
        <p>
          This local preview is not a real game session. Results are temporary
          and no learning data or XP has been saved.
        </p>
      </div>

      <dl className={styles.resultsGrid}>
        <div className={styles.scoreMetric}>
          <dt>Score</dt>
          <dd>
            {correctCount}<span>/{totalQuestions}</span>
          </dd>
        </div>
        <div>
          <dt>Accuracy</dt>
          <dd>{accuracy}%</dd>
        </div>
        <div>
          <dt>Best streak</dt>
          <dd>{bestStreak}</dd>
        </div>
        <div>
          <dt>XP</dt>
          <dd className={styles.notSaved}>Not awarded</dd>
        </div>
      </dl>

      <div className={styles.resultsActions}>
        <button
          className={styles.primaryButton}
          onClick={onPlayAgain}
          type="button"
        >
          Play demo again
        </button>
        <Link className={styles.secondaryButton} href="/games">
          Back to Games
        </Link>
        <button className={styles.secondaryButton} disabled type="button">
          Review mistakes · unavailable
        </button>
      </div>
    </section>
  );
}
