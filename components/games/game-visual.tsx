import type { GameSlug } from "@/lib/games/catalog";

export function GameVisual({ game }: { game: GameSlug }) {
  if (game === "word-rush") {
    return (
      <div className="game-card-visual word-rush-visual" aria-hidden="true">
        {Array.from("WORD").map((letter) => (
          <span key={letter}>{letter}</span>
        ))}
      </div>
    );
  }

  if (game === "verb-challenge") {
    return (
      <div className="game-card-visual verb-challenge-visual" aria-hidden="true">
        <span>go</span>
        <span>went</span>
        <span>gone</span>
      </div>
    );
  }

  return (
    <div className="game-card-visual describe-it-visual" aria-hidden="true">
      <span>clear</span>
      <span>bright</span>
      <span>calm</span>
    </div>
  );
}
