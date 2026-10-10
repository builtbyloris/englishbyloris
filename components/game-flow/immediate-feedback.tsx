"use client";

import { useEffect, useRef } from "react";

import type { DemoQuestion } from "@/lib/game-demo/fixture";

import styles from "./game-flow.module.css";

type ImmediateFeedbackProps = {
  isCorrect: boolean;
  isLastQuestion: boolean;
  onContinue: () => void;
  question: DemoQuestion;
};

export function ImmediateFeedback({
  isCorrect,
  isLastQuestion,
  onContinue,
  question,
}: ImmediateFeedbackProps) {
  const feedbackRef = useRef<HTMLElement>(null);
  const correctAnswer = question.options.find(
    (option) => option.id === question.correctOptionId,
  );

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    feedbackRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "nearest",
    });
  }, []);

  return (
    <section
      aria-live="polite"
      className={styles.feedback}
      data-correct={isCorrect}
      ref={feedbackRef}
    >
      <div className={styles.feedbackIcon} aria-hidden="true">
        {isCorrect ? "✓" : "×"}
      </div>
      <div className={styles.feedbackCopy}>
        <p className={styles.feedbackTitle}>
          {isCorrect ? "Correct" : "Not quite"}
        </p>
        <p>
          <strong>Answer:</strong> {correctAnswer?.label}
        </p>
        <p>{question.explanation}</p>
        <p className={styles.demoRewardNote}>Demo only · no XP is awarded</p>
      </div>
      <div className={styles.feedbackAction}>
        <button
          className={styles.primaryButton}
          onClick={onContinue}
          type="button"
        >
          {isLastQuestion ? "See results" : "Continue"}
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  );
}
