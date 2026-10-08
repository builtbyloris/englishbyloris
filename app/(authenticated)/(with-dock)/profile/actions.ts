"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAuthErrorPath } from "@/lib/auth/errors";
import {
  isCefrLevel,
  isLearningInterest,
} from "@/lib/onboarding/validation";
import {
  buildProfilePreferenceUpdate,
  type ProfileActionState,
  validateProfilePreferences,
} from "@/lib/profile/validation";
import { createClient } from "@/lib/supabase/server";

export async function updateProfilePreferences(
  _previousState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const validation = validateProfilePreferences(
    formData.get("level"),
    formData.getAll("interests"),
    formData.get("theme"),
  );

  if (!validation.success) {
    return {
      message: validation.error,
      savedPreferences: null,
      status: "error",
    };
  }

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || typeof userId !== "string") {
    redirect(getAuthErrorPath("auth_required"));
  }

  const { data: currentProfile, error: profileError } = await supabase
    .from("profiles")
    .select("english_level, learning_interests, theme")
    .eq("id", userId)
    .maybeSingle();

  if (profileError || !currentProfile) {
    return {
      message: "Your preferences could not be loaded. Please try again.",
      savedPreferences: null,
      status: "error",
    };
  }

  if (!isCefrLevel(currentProfile.english_level)) {
    return {
      message: "Your current English level is unavailable. Please try again.",
      savedPreferences: null,
      status: "error",
    };
  }

  const currentInterests = Array.isArray(currentProfile.learning_interests)
    ? currentProfile.learning_interests.filter(isLearningInterest)
    : [];
  const { resultingPreferences, updates } = buildProfilePreferenceUpdate(
    {
      interests: currentInterests,
      level: currentProfile.english_level,
      theme:
        currentProfile.theme === "light" || currentProfile.theme === "dark"
          ? currentProfile.theme
          : null,
    },
    validation.data,
  );

  if (Object.keys(updates).length > 0) {
    const { error: updateError } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId);

    if (updateError) {
      return {
        message: "Your preferences could not be saved. Please try again.",
        savedPreferences: null,
        status: "error",
      };
    }

    revalidatePath("/", "layout");
  }

  return {
    message:
      Object.keys(updates).length > 0
        ? "Preferences saved."
        : "Your preferences are already up to date.",
    savedPreferences: {
      interests: resultingPreferences.interests,
      level: resultingPreferences.level,
      theme: resultingPreferences.theme,
    },
    status: "success",
  };
}
