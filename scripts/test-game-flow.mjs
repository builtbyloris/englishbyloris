import assert from "node:assert/strict";

import { syntheticDemoQuestions } from "../lib/game-demo/fixture.ts";
import {
  createGameDemoState,
  gameDemoReducer,
} from "../lib/game-demo/session-machine.ts";

assert.equal(syntheticDemoQuestions.length, 10);

for (const question of syntheticDemoQuestions) {
  assert.equal(question.options.length, 4);
  assert.equal(new Set(question.options.map((option) => option.id)).size, 4);
  assert.ok(
    question.options.some((option) => option.id === question.correctOptionId),
  );
}

let state = createGameDemoState(syntheticDemoQuestions.length);
assert.equal(state.phase, "intro");

state = gameDemoReducer(state, { type: "CONTINUE" });
assert.equal(state.phase, "intro", "cannot advance before the demo starts");

state = gameDemoReducer(state, { type: "START" });
assert.equal(state.phase, "question");

const beforePrematureContinue = state;
state = gameDemoReducer(state, { type: "CONTINUE" });
assert.strictEqual(
  state,
  beforePrematureContinue,
  "cannot advance without answering",
);

state = gameDemoReducer(state, { type: "REQUEST_EXIT" });
assert.equal(state.phase, "exit");
state = gameDemoReducer(state, { type: "KEEP_PLAYING" });
assert.equal(state.phase, "question");

for (const [index, question] of syntheticDemoQuestions.entries()) {
  const correctOption = question.options.find(
    (option) => option.id === question.correctOptionId,
  );
  assert.ok(correctOption);

  state = gameDemoReducer(state, {
    type: "ANSWER",
    isCorrect: true,
    optionId: correctOption.id,
    questionId: question.id,
  });
  assert.equal(state.phase, "feedback");
  assert.equal(state.answers.length, index + 1);

  const afterDuplicate = gameDemoReducer(state, {
    type: "ANSWER",
    isCorrect: false,
    optionId: question.options[1].id,
    questionId: question.id,
  });
  assert.strictEqual(
    afterDuplicate,
    state,
    "a second answer must be ignored",
  );

  state = gameDemoReducer(state, { type: "CONTINUE" });
  assert.equal(
    state.phase,
    index === syntheticDemoQuestions.length - 1 ? "results" : "question",
  );
}

assert.equal(state.correctCount, 10);
assert.equal(state.bestStreak, 10);
assert.equal(state.answers.length, 10);

state = gameDemoReducer(state, { type: "PLAY_AGAIN" });
assert.equal(state.phase, "question");
assert.equal(state.correctCount, 0);
assert.equal(state.answers.length, 0);

const firstQuestion = syntheticDemoQuestions[0];
const wrongOption = firstQuestion.options.find(
  (option) => option.id !== firstQuestion.correctOptionId,
);
assert.ok(wrongOption);
state = gameDemoReducer(state, {
  type: "ANSWER",
  isCorrect: false,
  optionId: wrongOption.id,
  questionId: firstQuestion.id,
});
assert.equal(state.currentStreak, 0);
assert.equal(state.correctCount, 0);

state = gameDemoReducer(state, { type: "REQUEST_EXIT" });
assert.equal(state.phase, "exit");
state = gameDemoReducer(state, { type: "KEEP_PLAYING" });
assert.equal(state.phase, "feedback", "feedback survives a cancelled exit");

state = gameDemoReducer(state, { type: "REQUEST_EXIT" });
state = gameDemoReducer(state, { type: "LEAVE" });
assert.equal(state.phase, "intro");
assert.equal(state.answers.length, 0);

assert.throws(() => createGameDemoState(0));

console.log("Game flow state-machine and synthetic fixture tests passed.");
