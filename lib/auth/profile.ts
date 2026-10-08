import type { SupabaseClient } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

type AuthenticatedProfile = {
  displayName: string | null;
  id: string;
  onboardingCompleted: boolean;
};

export type AuthState =
  | { status: "signed-out" }
  | { status: "profile-unavailable" }
  | { profile: AuthenticatedProfile; status: "signed-in" };

export async function getAuthState(existingClient?: SupabaseClient): Promise<AuthState> {
  const supabase = existingClient ?? (await createClient());
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || typeof userId !== "string") {
    return { status: "signed-out" };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("display_name, onboarding_completed")
    .eq("id", userId)
    .maybeSingle();

  if (profileError || !profile) {
    return { status: "profile-unavailable" };
  }

  return {
    profile: {
      displayName: profile.display_name,
      id: userId,
      onboardingCompleted: profile.onboarding_completed,
    },
    status: "signed-in",
  };
}

export function getProfileDestination(profile: AuthenticatedProfile) {
  return profile.onboardingCompleted ? "/home" : "/onboarding";
}
