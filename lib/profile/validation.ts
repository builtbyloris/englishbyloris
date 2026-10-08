import {
  isCefrLevel,
  isLearningInterest,
  LEARNING_INTERESTS,
  type CefrLevel,
  type LearningInterest,
} from "@/lib/onboarding/validation";

export const APP_THEMES = ["light", "dark"] as const;

export type AppTheme = (typeof APP_THEMES)[number];

export type ProfilePreferences = {
  interests: LearningInterest[];
  level: CefrLevel;
  theme: AppTheme | null;
};

export type EditableProfileUpdate = {
  english_level?: CefrLevel;
  learning_interests?: LearningInterest[];
  theme?: AppTheme;
};

export type ProfileActionState = {
  message: string | null;
  savedPreferences: ProfilePreferences | null;
  status: "error" | "idle" | "success";
};

type ProfileValidationResult =
  | { data: ProfilePreferences; success: true }
  | { error: string; success: false };

export function isAppTheme(value: unknown): value is AppTheme {
  return APP_THEMES.includes(value as AppTheme);
}

export function validateProfilePreferences(
  level: unknown,
  interests: unknown[],
  theme: unknown,
): ProfileValidationResult {
  if (!isCefrLevel(level)) {
    return { error: "Choose a valid English level.", success: false };
  }

  if (
    interests.length === 0 ||
    interests.length > LEARNING_INTERESTS.length ||
    !interests.every(isLearningInterest) ||
    new Set(interests).size !== interests.length
  ) {
    return {
      error: "Choose at least one valid learning interest.",
      success: false,
    };
  }

  if (theme !== "" && theme !== null && !isAppTheme(theme)) {
    return { error: "Choose Light or Dark theme.", success: false };
  }

  return {
    data: {
      interests: LEARNING_INTERESTS.filter((interest) =>
        interests.includes(interest),
      ),
      level,
      theme: isAppTheme(theme) ? theme : null,
    },
    success: true,
  };
}

function haveSameInterests(
  current: LearningInterest[],
  next: LearningInterest[],
) {
  return (
    current.length === next.length &&
    current.every((interest) => next.includes(interest))
  );
}

export function buildProfilePreferenceUpdate(
  current: ProfilePreferences,
  next: ProfilePreferences,
) {
  const updates: EditableProfileUpdate = {};

  if (current.level !== next.level) {
    updates.english_level = next.level;
  }

  if (!haveSameInterests(current.interests, next.interests)) {
    updates.learning_interests = next.interests;
  }

  if (next.theme && current.theme !== next.theme) {
    updates.theme = next.theme;
  }

  return {
    resultingPreferences: {
      ...next,
      theme: next.theme ?? current.theme,
    },
    updates,
  };
}
