"use server";

import { redirect } from "next/navigation";

import { getAuthErrorPath } from "@/lib/auth/errors";
import {
  type OnboardingActionState,
  validateOnboardingPreferences,
} from "@/lib/onboarding/validation";
import { createClient } from "@/lib/supabase/server";

export async function completeOnboarding(
  _previousState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const validation = validateOnboardingPreferences(
    formData.get("level"),
    formData.getAll("interests"),
  );

  if (!validation.success) {
    return { error: validation.error };
  }

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || typeof userId !== "string") {
    redirect(getAuthErrorPath("auth_required"));
  }

  const { data: updatedProfile, error: updateError } = await supabase
    .from("profiles")
    .update({
      english_level: validation.data.level,
      learning_interests: validation.data.interests,
      onboarding_completed: true,
    })
    .eq("id", userId)
    .eq("onboarding_completed", false)
    .select("onboarding_completed")
    .maybeSingle();

  if (updateError) {
    return {
      error: "Your preferences could not be saved. Please try again.",
    };
  }

  if (!updatedProfile) {
    const { data: currentProfile, error: currentProfileError } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", userId)
      .maybeSingle();

    if (currentProfileError || !currentProfile?.onboarding_completed) {
      return {
        error: "Your preferences could not be saved. Please try again.",
      };
    }
  }

  redirect("/home");
}
