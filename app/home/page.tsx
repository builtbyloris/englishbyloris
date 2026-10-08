import { redirect } from "next/navigation";

import { SignOutForm } from "@/components/auth/sign-out-form";
import { getAuthErrorPath } from "@/lib/auth/errors";
import { getAuthState } from "@/lib/auth/profile";

export default async function HomePage() {
  const authState = await getAuthState();

  if (authState.status === "signed-out") {
    redirect(getAuthErrorPath("auth_required"));
  }

  if (authState.status === "profile-unavailable") {
    redirect(getAuthErrorPath("profile_unavailable"));
  }

  if (!authState.profile.onboardingCompleted) {
    redirect("/onboarding");
  }

  return (
    <main className="app-shell">
      <div className="app-container placeholder-content">
        <p className="wordmark wordmark-small">englishbyloris</p>
        <section className="placeholder-card" aria-labelledby="home-title">
          <p className="eyebrow">Signed in</p>
          <h1 id="home-title">Home</h1>
          <p>Your practice experience will be added in a later milestone.</p>
          <SignOutForm />
        </section>
      </div>
    </main>
  );
}
