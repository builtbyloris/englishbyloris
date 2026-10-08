"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import { completeOnboarding } from "@/app/onboarding/actions";
import {
  CEFR_LEVELS,
  type CefrLevel,
  LEARNING_INTERESTS,
  type LearningInterest,
  type OnboardingActionState,
} from "@/lib/onboarding/validation";

const LEVEL_LABELS: Record<CefrLevel, string> = {
  A1: "Beginner",
  A2: "Elementary",
  B1: "Intermediate",
  B2: "Upper Intermediate",
};

const INTEREST_DESCRIPTIONS: Record<LearningInterest, string> = {
  Adjectives: "Describe people, places and ideas with more precision.",
  Verbs: "Practise useful forms, tenses and everyday actions.",
  Vocabulary: "Build a broader range of practical words and meanings.",
};

const INITIAL_ACTION_STATE: OnboardingActionState = { error: null };

type OnboardingFlowProps = {
  initialInterests: LearningInterest[];
  initialLevel: CefrLevel | null;
};

export function OnboardingFlow({
  initialInterests,
  initialLevel,
}: OnboardingFlowProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [level, setLevel] = useState<CefrLevel | null>(initialLevel);
  const [interests, setInterests] =
    useState<LearningInterest[]>(initialInterests);
  const [actionState, formAction, pending] = useActionState(
    completeOnboarding,
    INITIAL_ACTION_STATE,
  );
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    stepHeadingRef.current?.focus();
  }, [step]);

  function toggleInterest(interest: LearningInterest) {
    setInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest],
    );
  }

  return (
    <section className="onboarding-card" aria-labelledby="onboarding-title">
      <div className="step-indicator" aria-label={`Step ${step} of 2`}>
        <span aria-current={step === 1 ? "step" : undefined}>1</span>
        <span className="step-line" aria-hidden="true" />
        <span aria-current={step === 2 ? "step" : undefined}>2</span>
      </div>

      <form action={formAction} className="onboarding-form">
        {step === 1 ? (
          <fieldset className="onboarding-step">
            <legend className="sr-only">Choose your English level</legend>
            <div className="onboarding-heading">
              <p className="eyebrow">Step 1 of 2</p>
              <h1 id="onboarding-title" ref={stepHeadingRef} tabIndex={-1}>
                What is your English level?
              </h1>
              <p>Choose the level that feels closest to you. You can change it later.</p>
            </div>

            <div className="selection-grid level-grid">
              {CEFR_LEVELS.map((option) => (
                <label
                  className="selection-card"
                  data-selected={level === option}
                  key={option}
                >
                  <input
                    checked={level === option}
                    className="selection-control"
                    name="level-preview"
                    onChange={() => setLevel(option)}
                    required
                    type="radio"
                    value={option}
                  />
                  <span className="level-code">{option}</span>
                  <span className="selection-copy">{LEVEL_LABELS[option]}</span>
                </label>
              ))}
            </div>

            <div className="onboarding-actions onboarding-actions-end">
              <button
                className="button button-primary"
                disabled={!level}
                onClick={() => setStep(2)}
                type="button"
              >
                Continue
              </button>
            </div>
          </fieldset>
        ) : (
          <fieldset className="onboarding-step" disabled={pending}>
            <legend className="sr-only">Choose your learning interests</legend>
            <input name="level" type="hidden" value={level ?? ""} />

            <div className="onboarding-heading">
              <p className="eyebrow">Step 2 of 2</p>
              <h1 id="onboarding-title" ref={stepHeadingRef} tabIndex={-1}>
                What would you like to practise?
              </h1>
              <p>Select one or more interests to shape your recommendations.</p>
            </div>

            <div className="selection-grid interest-grid">
              {LEARNING_INTERESTS.map((interest) => (
                <label
                  className="selection-card selection-card-detail"
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
                  <span className="selection-title">{interest}</span>
                  <span className="selection-description">
                    {INTEREST_DESCRIPTIONS[interest]}
                  </span>
                  <span className="selection-mark" aria-hidden="true">
                    ✓
                  </span>
                </label>
              ))}
            </div>

            <p className="selection-summary" aria-live="polite">
              {interests.length === 0
                ? "Choose at least one interest."
                : `${interests.length} ${interests.length === 1 ? "interest" : "interests"} selected.`}
            </p>

            {actionState.error ? (
              <p className="auth-error" role="alert">
                {actionState.error}
              </p>
            ) : null}

            <div className="onboarding-actions">
              <button
                className="button button-secondary"
                disabled={pending}
                onClick={() => setStep(1)}
                type="button"
              >
                Back
              </button>
              <button
                className="button button-primary"
                disabled={pending || interests.length === 0 || !level}
                type="submit"
              >
                {pending ? "Saving…" : "Finish setup"}
              </button>
            </div>
          </fieldset>
        )}
      </form>
    </section>
  );
}
