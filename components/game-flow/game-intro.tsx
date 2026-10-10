import type { GameDefinition } from "@/lib/games/catalog";
import type { CefrLevel } from "@/lib/onboarding/validation";

import styles from "./game-flow.module.css";

type GameIntroProps = {
  game: GameDefinition;
  level: CefrLevel;
  onStart: () => void;
};

export function GameIntro({ game, level, onStart }: GameIntroProps) {
  return (
    <section className={styles.intro} aria-labelledby="game-demo-title">
      <div className={styles.introCopy}>
        <span className={styles.demoBadge}>Synthetic UI demo</span>
        <p className={styles.eyebrow}>{game.category}</p>
        <h1 id="game-demo-title">{game.title}</h1>
        <p>{game.objective}</p>
      </div>

      <dl className={styles.sessionDetails}>
        <div>
          <dt>Level</dt>
          <dd>{level}</dd>
        </div>
        <div>
          <dt>Topic</dt>
          <dd>Mixed</dd>
        </div>
        <div>
          <dt>Questions</dt>
          <dd>{game.questionCount}</dd>
        </div>
        <div>
          <dt>Duration</dt>
          <dd>{game.duration}</dd>
        </div>
      </dl>

      <div className={styles.introAction}>
        <button className={styles.primaryButton} onClick={onStart} type="button">
          Start demo
          <span aria-hidden="true">→</span>
        </button>
        <p>
          Demo answers and results stay on this device and are never saved. No
          XP is awarded.
        </p>
      </div>
    </section>
  );
}
