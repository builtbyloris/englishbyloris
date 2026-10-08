import { redirect } from "next/navigation";

import { SignOutForm } from "@/components/auth/sign-out-form";
import { getAuthErrorPath } from "@/lib/auth/errors";
import { getAuthState } from "@/lib/auth/profile";

export default async function OnboardingPage() {
  const authState = await getAuthState();

  if (authState.status === "signed-out") {
    redirect(getAuthErrorPath("auth_required"));
  }

  if (authState.status === "profile-unavailable") {
    redirect(getAuthErrorPath("profile_unavailable"));
  }

  if (authState.profile.onboardingCompleted) {
    redirect("/home");
  }

  return (
    <main className="app-shell">
      <div className="app-container placeholder-content">
        <p className="wordmark wordmark-small">englishbyloris</p>
        <section className="placeholder-card" aria-labelledby="onboarding-title">
          <p className="eyebrow">Account ready</p>
          <h1 id="onboarding-title">Onboarding</h1>
          <p>Your learning setup will be added in the next milestone.</p>
          <SignOutForm />
        </section>
      </div>
    </main>
  );
}
