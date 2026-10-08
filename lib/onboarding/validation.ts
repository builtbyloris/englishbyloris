export const CEFR_LEVELS = ["A1", "A2", "B1", "B2"] as const;
export const LEARNING_INTERESTS = [
  "Vocabulary",
  "Verbs",
  "Adjectives",
] as const;

export type CefrLevel = (typeof CEFR_LEVELS)[number];
export type LearningInterest = (typeof LEARNING_INTERESTS)[number];

export type OnboardingActionState = {
  error: string | null;
};

type ValidOnboardingPreferences = {
  interests: LearningInterest[];
  level: CefrLevel;
};

type OnboardingValidationResult =
  | { data: ValidOnboardingPreferences; success: true }
  | { error: string; success: false };

export function isCefrLevel(value: unknown): value is CefrLevel {
  return CEFR_LEVELS.includes(value as CefrLevel);
}

export function isLearningInterest(value: unknown): value is LearningInterest {
  return LEARNING_INTERESTS.includes(value as LearningInterest);
}

export function validateOnboardingPreferences(
  level: unknown,
  interests: unknown[],
): OnboardingValidationResult {
  if (!isCefrLevel(level)) {
    return { error: "Choose a valid English level.", success: false };
  }

  if (
    interests.length === 0 ||
    interests.length > LEARNING_INTERESTS.length ||
    !interests.every(isLearningInterest) ||
    new Set(interests).size !== interests.length
  ) {
    return { error: "Choose at least one valid learning interest.", success: false };
  }

  return {
    data: { interests, level },
    success: true,
  };
}
