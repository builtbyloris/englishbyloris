import Link from "next/link";
import { notFound } from "next/navigation";

import { GameFlowDemo } from "@/components/game-flow/game-flow-demo";
import { gameCatalog, type GameSlug } from "@/lib/games/catalog";

import styles from "./page.module.css";

const supportedThemes = ["light", "dark"] as const;

type PreviewTheme = (typeof supportedThemes)[number];

type GameFlowQaPageProps = {
  searchParams: Promise<{
    game?: string | string[];
    theme?: string | string[];
  }>;
};

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function isGameSlug(value: string | undefined): value is GameSlug {
  return gameCatalog.some((game) => game.slug === value);
}

function isPreviewTheme(value: string | undefined): value is PreviewTheme {
  return supportedThemes.some((theme) => theme === value);
}

export default async function GameFlowQaPage({
  searchParams,
}: GameFlowQaPageProps) {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  const params = await searchParams;
  const requestedGame = getParam(params.game);
  const requestedTheme = getParam(params.theme);
  const gameSlug = isGameSlug(requestedGame) ? requestedGame : "word-rush";
  const theme = isPreviewTheme(requestedTheme) ? requestedTheme : "light";
  const game = gameCatalog.find((item) => item.slug === gameSlug)!;

  return (
    <main className={styles.page} data-theme={theme}>
      <div className={styles.toolbar} aria-label="Game flow QA controls">
        <div className={styles.toolbarHeader}>
          <span className={styles.wordmark}>englishbyloris</span>
          <span className={styles.qaLabel}>Game flow QA</span>
        </div>

        <nav className={styles.toolbarNav} aria-label="Preview game">
          {gameCatalog.map((item) => (
            <Link
              aria-current={item.slug === gameSlug ? "page" : undefined}
              href={`/game-flow-qa?game=${item.slug}&theme=${theme}`}
              key={item.slug}
            >
              {item.title}
            </Link>
          ))}
        </nav>

        <nav className={styles.toolbarNav} aria-label="Preview theme">
          {supportedThemes.map((item) => (
            <Link
              aria-current={item === theme ? "page" : undefined}
              href={`/game-flow-qa?game=${gameSlug}&theme=${item}`}
              key={item}
            >
              {item === "light" ? "Light" : "Dark"}
            </Link>
          ))}
        </nav>
      </div>

      <div className={styles.preview}>
        <GameFlowDemo game={game} key={game.slug} level="B1" />
      </div>
    </main>
  );
}
