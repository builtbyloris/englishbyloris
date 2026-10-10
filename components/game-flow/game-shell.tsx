import type { ReactNode } from "react";

import type { GameDefinition } from "@/lib/games/catalog";

import styles from "./game-flow.module.css";

type GameShellProps = {
  children: ReactNode;
  currentQuestion: number;
  game: GameDefinition;
  onExit: () => void;
  totalQuestions: number;
};

export function GameShell({
  children,
  currentQuestion,
  game,
  onExit,
  totalQuestions,
}: GameShellProps) {
  const progress = (currentQuestion / totalQuestions) * 100;

  return (
    <section className={styles.gameShell} aria-label={`${game.title} demo`}>
      <header className={styles.gameHeader}>
        <button
          aria-label="Exit demo session"
          className={styles.exitButton}
          onClick={onExit}
          type="button"
        >
          <span aria-hidden="true">×</span>
        </button>
        <strong>{game.title}</strong>
        <span className={styles.questionCount}>
          {currentQuestion} <span aria-hidden="true">/</span> {totalQuestions}
        </span>
      </header>
      <div
        aria-label={`Question ${currentQuestion} of ${totalQuestions}`}
        aria-valuemax={totalQuestions}
        aria-valuemin={1}
        aria-valuenow={currentQuestion}
        className={styles.progressTrack}
        role="progressbar"
      >
        <span style={{ width: `${progress}%` }} />
      </div>
      <div className={styles.gameBody}>{children}</div>
    </section>
  );
}
