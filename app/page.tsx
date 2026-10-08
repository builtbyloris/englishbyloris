import { redirect } from "next/navigation";

import { GoogleSignInForm } from "@/components/auth/google-sign-in-form";
import { getAuthErrorMessage } from "@/lib/auth/errors";
import { getAuthState, getProfileDestination } from "@/lib/auth/profile";

type LandingPageProps = {
  searchParams: Promise<{ auth_error?: string | string[] }>;
};

export default async function LandingPage({ searchParams }: LandingPageProps) {
  const [authState, params] = await Promise.all([
    getAuthState(),
    searchParams,
  ]);

  if (authState.status === "signed-in") {
    redirect(getProfileDestination(authState.profile));
  }

  const authError =
    authState.status === "profile-unavailable"
      ? getAuthErrorMessage("profile_unavailable")
      : getAuthErrorMessage(params.auth_error);

  return (
    <main className="app-shell">
      <div className="app-container landing-content">
        <section className="auth-card" aria-labelledby="landing-title">
          <h1 className="wordmark" id="landing-title">
            englishbyloris
          </h1>
          <p className="auth-intro">
            Short, focused English practice adapted to your level.
          </p>
          {authError ? (
            <p className="auth-error" role="alert">
              {authError}
            </p>
          ) : null}
          <GoogleSignInForm />
        </section>
      </div>
    </main>
  );
}
