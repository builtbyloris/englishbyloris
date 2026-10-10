import type { DemoQuestion } from "@/lib/game-demo/fixture";

import styles from "./game-flow.module.css";

type QuestionViewProps = {
  feedbackVisible: boolean;
  onSelect: (optionId: string) => void;
  question: DemoQuestion;
  selectedOptionId: string | null;
};

function getOptionState(
  optionId: string,
  question: DemoQuestion,
  selectedOptionId: string | null,
  feedbackVisible: boolean,
) {
  if (!feedbackVisible) {
    return undefined;
  }

  if (optionId === question.correctOptionId) {
    return "correct";
  }

  if (optionId === selectedOptionId) {
    return "incorrect";
  }

  return "muted";
}

export function QuestionView({
  feedbackVisible,
  onSelect,
  question,
  selectedOptionId,
}: QuestionViewProps) {
  return (
    <div className={styles.questionView}>
      <div className={styles.questionCopy}>
        <p className={styles.eyebrow}>Choose one answer</p>
        <h1 tabIndex={-1}>{question.prompt}</h1>
      </div>

      <div className={styles.options} role="group" aria-label="Answer options">
        {question.options.map((option, index) => {
          const optionState = getOptionState(
            option.id,
            question,
            selectedOptionId,
            feedbackVisible,
          );

          return (
            <button
              aria-pressed={selectedOptionId === option.id}
              className={styles.option}
              data-state={optionState}
              disabled={feedbackVisible}
              key={option.id}
              onClick={() => onSelect(option.id)}
              type="button"
            >
              <span className={styles.optionKey} aria-hidden="true">
                {String.fromCharCode(65 + index)}
              </span>
              <span>{option.label}</span>
              {optionState === "correct" ? (
                <span className={styles.optionStatus} aria-label="Correct answer">
                  ✓
                </span>
              ) : null}
              {optionState === "incorrect" ? (
                <span className={styles.optionStatus} aria-label="Your answer was incorrect">
                  ×
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
