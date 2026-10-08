import { GameHubCard } from "@/components/games/game-hub-card";
import { gameCatalog } from "@/lib/games/catalog";
import { cefrDescriptions } from "@/lib/learning/cefr";
import type { CefrLevel } from "@/lib/onboarding/validation";

export function GamesHub({ level }: { level: CefrLevel | null }) {
  return (
    <div className="games-hub-page">
      <header className="games-hub-header">
        <div className="games-hub-intro">
          <p className="home-kicker">Practice library</p>
          <h1>Games</h1>
          <p>
            Three focused formats for building vocabulary, grammar and
            descriptive range in short sessions.
          </p>
        </div>

        <div className="games-level-card" aria-label="Current English level">
          <span>Your level</span>
          {level ? (
            <strong>
              {level} · {cefrDescriptions[level]}
            </strong>
          ) : (
            <strong>Unavailable</strong>
          )}
          <p>Each game will adapt its content to this level.</p>
        </div>
      </header>

      <div className="games-hub-notice" role="status">
        <span aria-hidden="true" />
        <p>
          Game previews are ready. Gameplay will be enabled in a later
          milestone.
        </p>
      </div>

      <section className="game-hub-list" aria-label="Available game formats">
        {gameCatalog.map((game) => (
          <GameHubCard game={game} key={game.slug} level={level} />
        ))}
      </section>
    </div>
  );
}
