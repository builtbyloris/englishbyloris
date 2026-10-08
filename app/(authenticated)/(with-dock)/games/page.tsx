import { GamesHub } from "@/components/games/games-hub";
import { getAuthState } from "@/lib/auth/profile";

export default async function GamesPage() {
  const authState = await getAuthState();

  if (authState.status !== "signed-in") {
    return (
      <section className="home-state-card" role="alert">
        <p className="home-kicker">Games unavailable</p>
        <h1>We couldn&apos;t load your profile.</h1>
        <p>Refresh the page to try again.</p>
      </section>
    );
  }

  return <GamesHub level={authState.profile.englishLevel} />;
}
