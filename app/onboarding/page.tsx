import { redirect } from "next/navigation";

import { SignOutForm } from "@/components/auth/sign-out-form";
import { OnboardingFlow } from "@/features/onboarding/onboarding-flow";
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
      <div className="app-container onboarding-content">
        <header className="onboarding-header">
          <p className="wordmark wordmark-small">englishbyloris</p>
          <SignOutForm />
        </header>
        <OnboardingFlow
          initialInterests={authState.profile.learningInterests}
          initialLevel={authState.profile.englishLevel}
        />
      </div>
    </main>
  );
}
