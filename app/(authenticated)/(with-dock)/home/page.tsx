import { HomeExperience } from "@/components/home/home-experience";
import { getAuthState } from "@/lib/auth/profile";

export default async function HomePage() {
  const authState = await getAuthState();

  if (authState.status !== "signed-in") {
    return (
      <section className="home-state-card" role="alert">
        <p className="home-kicker">Home unavailable</p>
        <h1>We couldn&apos;t load your profile.</h1>
        <p>Refresh the page to try again.</p>
      </section>
    );
  }

  return <HomeExperience profile={authState.profile} />;
}
