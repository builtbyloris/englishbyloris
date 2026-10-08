import { GameVisual } from "@/components/games/game-visual";
import type { GameDefinition } from "@/lib/games/catalog";
import { cefrDescriptions } from "@/lib/learning/cefr";
import type { CefrLevel } from "@/lib/onboarding/validation";

type GameHubCardProps = {
  game: GameDefinition;
  level: CefrLevel | null;
};

export function GameHubCard({ game, level }: GameHubCardProps) {
  const titleId = `${game.slug}-title`;

  return (
    <article
      className="game-hub-card"
      data-game={game.slug}
      aria-labelledby={titleId}
    >
      <div className="game-hub-visual">
        <p className="game-hub-category">{game.category}</p>
        <GameVisual game={game.slug} />
        <div className="game-hub-session" aria-label="Typical session">
          <span>{game.questionCount} questions</span>
          <span aria-hidden="true">·</span>
          <span>{game.duration}</span>
        </div>
      </div>

      <div className="game-hub-body">
        <div className="game-hub-title-row">
          <div>
            <p className="home-kicker">Practice mode</p>
            <h2 id={titleId}>{game.title}</h2>
          </div>
          <span className="game-unavailable-badge">Coming soon</span>
        </div>

        <p className="game-hub-objective">{game.objective}</p>

        <div className="game-level-focus">
          <p>For your current level</p>
          {level ? (
            <>
              <strong>
                {level} · {cefrDescriptions[level]}
              </strong>
              <span>{game.levelFocus[level]}</span>
            </>
          ) : (
            <span>Your level is currently unavailable.</span>
          )}
        </div>

        <div className="game-exercise-types">
          <p>Exercise types</p>
          <ul>
            {game.exerciseTypes.map((exerciseType) => (
              <li key={exerciseType}>{exerciseType}</li>
            ))}
          </ul>
        </div>

        <button className="button button-secondary" type="button" disabled>
          Not available yet
        </button>
      </div>
    </article>
  );
}
