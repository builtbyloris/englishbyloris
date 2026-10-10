export const GAME_DEMO_QUESTION_COUNT = 10;

export type GameDemoAnswer = {
  isCorrect: boolean;
  optionId: string;
  questionId: string;
};

export type GameDemoPhase =
  | "exit"
  | "feedback"
  | "intro"
  | "question"
  | "results";

type ResumablePhase = Extract<GameDemoPhase, "feedback" | "question">;

export type GameDemoState = {
  answers: readonly GameDemoAnswer[];
  bestStreak: number;
  correctCount: number;
  currentIndex: number;
  currentStreak: number;
  phase: GameDemoPhase;
  resumePhase: ResumablePhase | null;
  selectedOptionId: string | null;
  totalQuestions: number;
};

export type GameDemoEvent =
  | { type: "START" }
  | {
      type: "ANSWER";
      isCorrect: boolean;
      optionId: string;
      questionId: string;
    }
  | { type: "CONTINUE" }
  | { type: "REQUEST_EXIT" }
  | { type: "KEEP_PLAYING" }
  | { type: "LEAVE" }
  | { type: "PLAY_AGAIN" };

export function createGameDemoState(
  totalQuestions = GAME_DEMO_QUESTION_COUNT,
): GameDemoState {
  if (!Number.isInteger(totalQuestions) || totalQuestions < 1) {
    throw new Error("A demo session requires at least one question.");
  }

  return {
    answers: [],
    bestStreak: 0,
    correctCount: 0,
    currentIndex: 0,
    currentStreak: 0,
    phase: "intro",
    resumePhase: null,
    selectedOptionId: null,
    totalQuestions,
  };
}

function startSession(state: GameDemoState): GameDemoState {
  return {
    ...createGameDemoState(state.totalQuestions),
    phase: "question",
  };
}

export function gameDemoReducer(
  state: GameDemoState,
  event: GameDemoEvent,
): GameDemoState {
  switch (event.type) {
    case "START":
      return state.phase === "intro" ? startSession(state) : state;

    case "ANSWER": {
      if (state.phase !== "question" || state.selectedOptionId !== null) {
        return state;
      }

      const currentStreak = event.isCorrect ? state.currentStreak + 1 : 0;

      return {
        ...state,
        answers: [
          ...state.answers,
          {
            isCorrect: event.isCorrect,
            optionId: event.optionId,
            questionId: event.questionId,
          },
        ],
        bestStreak: Math.max(state.bestStreak, currentStreak),
        correctCount: state.correctCount + (event.isCorrect ? 1 : 0),
        currentStreak,
        phase: "feedback",
        selectedOptionId: event.optionId,
      };
    }

    case "CONTINUE":
      if (state.phase !== "feedback") {
        return state;
      }

      if (state.currentIndex === state.totalQuestions - 1) {
        return {
          ...state,
          phase: "results",
          resumePhase: null,
        };
      }

      return {
        ...state,
        currentIndex: state.currentIndex + 1,
        phase: "question",
        selectedOptionId: null,
      };

    case "REQUEST_EXIT":
      if (state.phase !== "question" && state.phase !== "feedback") {
        return state;
      }

      return {
        ...state,
        phase: "exit",
        resumePhase: state.phase,
      };

    case "KEEP_PLAYING":
      if (state.phase !== "exit" || state.resumePhase === null) {
        return state;
      }

      return {
        ...state,
        phase: state.resumePhase,
        resumePhase: null,
      };

    case "LEAVE":
      return state.phase === "exit"
        ? createGameDemoState(state.totalQuestions)
        : state;

    case "PLAY_AGAIN":
      return state.phase === "results" ? startSession(state) : state;

    default:
      return state;
  }
}
