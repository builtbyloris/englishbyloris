import { ProgressExperience } from "@/components/progress/progress-experience";
import { getAuthState } from "@/lib/auth/profile";

export default async function ProgressPage() {
  const authState = await getAuthState();

  if (authState.status !== "signed-in") {
    return (
      <section className="home-state-card" role="alert">
        <p className="home-kicker">Progress unavailable</p>
        <h1>We couldn&apos;t load your learning metrics.</h1>
        <p>Refresh the page to try again.</p>
      </section>
    );
  }

  return (
    <ProgressExperience
      currentStreak={authState.profile.currentStreak}
      xp={authState.profile.xp}
    />
  );
}
