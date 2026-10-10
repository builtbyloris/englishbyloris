"use client";

import { useEffect, useReducer, useRef } from "react";

import type { GameDefinition } from "@/lib/games/catalog";
import {
  syntheticDemoQuestions,
  type DemoQuestion,
} from "@/lib/game-demo/fixture";
import {
  createGameDemoState,
  gameDemoReducer,
} from "@/lib/game-demo/session-machine";
import type { CefrLevel } from "@/lib/onboarding/validation";

import { ExitConfirmation } from "./exit-confirmation";
import { GameIntro } from "./game-intro";
import { GameResults } from "./game-results";
import { GameShell } from "./game-shell";
import { ImmediateFeedback } from "./immediate-feedback";
import { QuestionView } from "./question-view";
import styles from "./game-flow.module.css";

type GameFlowDemoProps = {
  game: GameDefinition;
  level: CefrLevel;
};

function getSelectedAnswer(
  question: DemoQuestion,
  selectedOptionId: string | null,
) {
  if (selectedOptionId === null) {
    return null;
  }

  return {
    isCorrect: selectedOptionId === question.correctOptionId,
    optionId: selectedOptionId,
  };
}

export function GameFlowDemo({ game, level }: GameFlowDemoProps) {
  const [state, dispatch] = useReducer(
    gameDemoReducer,
    syntheticDemoQuestions.length,
    createGameDemoState,
  );
  const contentRef = useRef<HTMLDivElement>(null);
  const activeQuestion = syntheticDemoQuestions[state.currentIndex];
  const selectedAnswer = getSelectedAnswer(
    activeQuestion,
    state.selectedOptionId,
  );
  const activePhase = state.phase === "exit" ? state.resumePhase : state.phase;

  useEffect(() => {
    if (state.phase === "question" || state.phase === "results") {
      contentRef.current?.querySelector<HTMLElement>("h1")?.focus();
    }
  }, [state.currentIndex, state.phase]);

  return (
    <div
      className={styles.demo}
      data-game={game.slug}
      ref={contentRef}
    >
      {state.phase === "intro" ? (
        <GameIntro
          game={game}
          level={level}
          onStart={() => dispatch({ type: "START" })}
        />
      ) : null}

      {activePhase === "question" || activePhase === "feedback" ? (
        <GameShell
          currentQuestion={state.currentIndex + 1}
          game={game}
          onExit={() => dispatch({ type: "REQUEST_EXIT" })}
          totalQuestions={state.totalQuestions}
        >
          <QuestionView
            feedbackVisible={activePhase === "feedback"}
            onSelect={(optionId) =>
              dispatch({
                type: "ANSWER",
                isCorrect: optionId === activeQuestion.correctOptionId,
                optionId,
                questionId: activeQuestion.id,
              })
            }
            question={activeQuestion}
            selectedOptionId={state.selectedOptionId}
          />
          {activePhase === "feedback" && selectedAnswer ? (
            <ImmediateFeedback
              isCorrect={selectedAnswer.isCorrect}
              isLastQuestion={
                state.currentIndex === state.totalQuestions - 1
              }
              onContinue={() => dispatch({ type: "CONTINUE" })}
              question={activeQuestion}
            />
          ) : null}
        </GameShell>
      ) : null}

      {state.phase === "results" ? (
        <GameResults
          bestStreak={state.bestStreak}
          correctCount={state.correctCount}
          game={game}
          onPlayAgain={() => dispatch({ type: "PLAY_AGAIN" })}
          totalQuestions={state.totalQuestions}
        />
      ) : null}

      <ExitConfirmation
        onKeepPlaying={() => dispatch({ type: "KEEP_PLAYING" })}
        onLeave={() => dispatch({ type: "LEAVE" })}
        open={state.phase === "exit"}
      />
    </div>
  );
}
