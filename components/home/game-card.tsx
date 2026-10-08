import Link from "next/link";

type GameCardProps = {
  category: string;
  description: string;
  game: "describe-it" | "verb-challenge" | "word-rush";
  metadata: string;
  title: string;
};

function GameVisual({ game }: Pick<GameCardProps, "game">) {
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

export function GameCard({
  category,
  description,
  game,
  metadata,
  title,
}: GameCardProps) {
  return (
    <Link
      aria-label={`${title} — view in Games`}
      className="game-card"
      data-game={game}
      href="/games"
    >
      <p className="game-card-category">{category}</p>
      <GameVisual game={game} />
      <div className="game-card-copy">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <div className="game-card-footer">
        <span>{metadata}</span>
        <span className="game-card-link-copy" aria-hidden="true">
          View game <span>→</span>
        </span>
      </div>
    </Link>
  );
}
