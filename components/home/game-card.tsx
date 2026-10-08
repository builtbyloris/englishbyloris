import Link from "next/link";

import { GameVisual } from "@/components/games/game-visual";
import type { GameSlug } from "@/lib/games/catalog";

type GameCardProps = {
  category: string;
  description: string;
  game: GameSlug;
  metadata: string;
  title: string;
};

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
