"use client";

import { useActionState, useState } from "react";

import { updateProfilePreferences } from "@/app/(authenticated)/(with-dock)/profile/actions";
import { cefrDescriptions } from "@/lib/learning/cefr";
import {
  CEFR_LEVELS,
  LEARNING_INTERESTS,
  type CefrLevel,
  type LearningInterest,
} from "@/lib/onboarding/validation";
import {
  APP_THEMES,
  type AppTheme,
  type ProfileActionState,
} from "@/lib/profile/validation";

const INITIAL_ACTION_STATE: ProfileActionState = {
  message: null,
  savedPreferences: null,
  status: "idle",
};

const INTEREST_DESCRIPTIONS: Record<LearningInterest, string> = {
  Adjectives: "Descriptions, opposites and precise choices.",
  Verbs: "Useful forms, tenses and grammar in context.",
  Vocabulary: "Practical words, definitions and meaning.",
};

const THEME_DESCRIPTIONS: Record<AppTheme, string> = {
  dark: "A deep, low-glare surface with bright text.",
  light: "A soft, airy surface with dark text.",
};

function haveSameItems(
  current: LearningInterest[],
  next: LearningInterest[],
) {
  return (
    current.length === next.length &&
    current.every((interest) => next.includes(interest))
  );
}

export function ProfilePreferencesForm({
  initialInterests,
  initialLevel,
  initialTheme,
  preview,
}: {
  initialInterests: LearningInterest[];
  initialLevel: CefrLevel | null;
  initialTheme: AppTheme | null;
  preview: boolean;
}) {
  const [level, setLevel] = useState<CefrLevel | null>(initialLevel);
  const [interests, setInterests] =
    useState<LearningInterest[]>(initialInterests);
  const [theme, setTheme] = useState<AppTheme | null>(initialTheme);
  const [actionState, formAction, pending] = useActionState(
    updateProfilePreferences,
    INITIAL_ACTION_STATE,
  );
  const savedPreferences = actionState.savedPreferences ?? {
    interests: initialInterests,
    level: initialLevel,
    theme: initialTheme,
  };
  const hasChanges =
    level !== savedPreferences.level ||
    theme !== savedPreferences.theme ||
    !haveSameItems(interests, savedPreferences.interests);
  const canSave = Boolean(level && interests.length > 0 && hasChanges);

  function toggleInterest(interest: LearningInterest) {
    setInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest],
    );
  }

  return (
    <form
      action={preview ? undefined : formAction}
      className="profile-preferences"
      onSubmit={preview ? (event) => event.preventDefault() : undefined}
    >
      <section className="profile-preference-section" aria-labelledby="level-title">
        <div className="profile-section-copy">
          <p className="home-kicker">English level</p>
          <h2 id="level-title">Choose your current CEFR level</h2>
          <p>
            This changes only when you choose it. Practice performance will never
            advance your CEFR level automatically.
          </p>
        </div>

        <fieldset className="profile-options-grid profile-level-grid" disabled={pending}>
          <legend className="sr-only">English level</legend>
          {CEFR_LEVELS.map((option) => (
            <label
              className="profile-option-card"
              data-selected={level === option}
              key={option}
            >
              <input
                checked={level === option}
                className="selection-control"
                name="level"
                onChange={() => setLevel(option)}
                required
                type="radio"
                value={option}
              />
              <strong>{option}</strong>
              <span>{cefrDescriptions[option]}</span>
              <span className="profile-option-mark" aria-hidden="true">
                ✓
              </span>
            </label>
          ))}
        </fieldset>
      </section>

      <section
        className="profile-preference-section"
        aria-labelledby="interests-title"
      >
        <div className="profile-section-copy">
          <p className="home-kicker">Learning interests</p>
          <h2 id="interests-title">Shape what you practise</h2>
          <p>Select at least one interest. Every game remains available.</p>
        </div>

        <fieldset className="profile-options-grid profile-interest-grid" disabled={pending}>
          <legend className="sr-only">Learning interests</legend>
          {LEARNING_INTERESTS.map((interest) => (
            <label
              className="profile-option-card profile-interest-card"
              data-selected={interests.includes(interest)}
              key={interest}
            >
              <input
                checked={interests.includes(interest)}
                className="selection-control"
                name="interests"
                onChange={() => toggleInterest(interest)}
                type="checkbox"
                value={interest}
              />
              <strong>{interest}</strong>
              <span>{INTEREST_DESCRIPTIONS[interest]}</span>
              <span className="profile-option-mark" aria-hidden="true">
                ✓
              </span>
            </label>
          ))}
        </fieldset>
        <p className="profile-selection-summary" aria-live="polite">
          {interests.length === 0
            ? "Choose at least one interest before saving."
            : `${interests.length} ${interests.length === 1 ? "interest" : "interests"} selected.`}
        </p>
      </section>

      <section className="profile-preference-section" aria-labelledby="theme-title">
        <div className="profile-section-copy">
          <p className="home-kicker">Appearance</p>
          <h2 id="theme-title">Choose Light or Dark</h2>
          <p>
            Your choice follows you after refresh and sign-in. No preference is
            stored until you explicitly select one.
          </p>
        </div>

        <input name="theme" type="hidden" value={theme ?? ""} />
        <fieldset className="profile-options-grid profile-theme-grid" disabled={pending}>
          <legend className="sr-only">Theme preference</legend>
          {APP_THEMES.map((option) => (
            <label
              className="profile-option-card profile-theme-card"
              data-selected={theme === option}
              data-theme-preview={option}
              key={option}
            >
              <input
                checked={theme === option}
                className="selection-control"
                name="theme-preview"
                onChange={() => setTheme(option)}
                type="radio"
                value={option}
              />
              <span className="profile-theme-swatch" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <strong>{option === "light" ? "Light" : "Dark"}</strong>
              <span>{THEME_DESCRIPTIONS[option]}</span>
              <span className="profile-option-mark" aria-hidden="true">
                ✓
              </span>
            </label>
          ))}
        </fieldset>
        {theme === null ? (
          <p className="profile-theme-note">
            No theme preference is currently stored. The temporary technical
            fallback remains active.
          </p>
        ) : null}
      </section>

      <div className="profile-save-bar">
        <div aria-live="polite">
          {preview ? (
            <p>Preview mode — changes stay in this page and cannot be saved.</p>
          ) : actionState.message ? (
            <p data-status={actionState.status} role={actionState.status === "error" ? "alert" : "status"}>
              {actionState.message}
            </p>
          ) : (
            <p>{hasChanges ? "You have unsaved changes." : "Preferences are up to date."}</p>
          )}
        </div>
        <button
          className="button button-primary"
          disabled={preview || pending || !canSave}
          type="submit"
        >
          {preview ? "Preview only" : pending ? "Saving…" : "Save preferences"}
        </button>
      </div>
    </form>
  );
}
