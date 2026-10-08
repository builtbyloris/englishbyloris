import type { SupabaseClient } from "@supabase/supabase-js";

import {
  isCefrLevel,
  isLearningInterest,
  type CefrLevel,
  type LearningInterest,
} from "@/lib/onboarding/validation";
import { createClient } from "@/lib/supabase/server";

type AuthenticatedProfile = {
  displayName: string | null;
  englishLevel: CefrLevel | null;
  id: string;
  learningInterests: LearningInterest[];
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
    .select(
      "display_name, english_level, learning_interests, onboarding_completed",
    )
    .eq("id", userId)
    .maybeSingle();

  if (profileError || !profile) {
    return { status: "profile-unavailable" };
  }

  return {
    profile: {
      displayName: profile.display_name,
      englishLevel: isCefrLevel(profile.english_level)
        ? profile.english_level
        : null,
      id: userId,
      learningInterests: Array.isArray(profile.learning_interests)
        ? profile.learning_interests.filter(isLearningInterest)
        : [],
      onboardingCompleted: profile.onboarding_completed,
    },
    status: "signed-in",
  };
}

export function getProfileDestination(profile: AuthenticatedProfile) {
  return profile.onboardingCompleted ? "/home" : "/onboarding";
}
