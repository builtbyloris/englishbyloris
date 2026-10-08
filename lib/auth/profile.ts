import type { SupabaseClient } from "@supabase/supabase-js";
import { cache } from "react";

import {
  isCefrLevel,
  isLearningInterest,
  type CefrLevel,
  type LearningInterest,
} from "@/lib/onboarding/validation";
import { createClient } from "@/lib/supabase/server";

type AuthenticatedProfile = {
  currentStreak: number | null;
  displayName: string | null;
  englishLevel: CefrLevel | null;
  id: string;
  learningInterests: LearningInterest[];
  onboardingCompleted: boolean;
  xp: number | null;
};

export type AuthState =
  | { status: "signed-out" }
  | { status: "profile-unavailable" }
  | { profile: AuthenticatedProfile; status: "signed-in" };

function getNonnegativeMetric(value: unknown) {
  if (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value >= 0
  ) {
    return value;
  }

  if (typeof value === "string" && /^\d+$/.test(value)) {
    const parsedValue = Number(value);

    return Number.isSafeInteger(parsedValue) ? parsedValue : null;
  }

  return null;
}

async function resolveAuthState(
  existingClient?: SupabaseClient,
): Promise<AuthState> {
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
      "current_streak, display_name, english_level, learning_interests, onboarding_completed, xp",
    )
    .eq("id", userId)
    .maybeSingle();

  if (profileError || !profile) {
    return { status: "profile-unavailable" };
  }

  return {
    profile: {
      currentStreak: getNonnegativeMetric(profile.current_streak),
      displayName: profile.display_name,
      englishLevel: isCefrLevel(profile.english_level)
        ? profile.english_level
        : null,
      id: userId,
      learningInterests: Array.isArray(profile.learning_interests)
        ? profile.learning_interests.filter(isLearningInterest)
        : [],
      onboardingCompleted: profile.onboarding_completed,
      xp: getNonnegativeMetric(profile.xp),
    },
    status: "signed-in",
  };
}

const getCachedAuthState = cache(() => resolveAuthState());

export function getAuthState(existingClient?: SupabaseClient) {
  return existingClient
    ? resolveAuthState(existingClient)
    : getCachedAuthState();
}

export function getProfileDestination(profile: AuthenticatedProfile) {
  return profile.onboardingCompleted ? "/home" : "/onboarding";
}
