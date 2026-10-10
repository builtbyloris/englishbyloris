export type DemoOption = {
  id: string;
  label: string;
};

export type DemoQuestion = {
  correctOptionId: string;
  explanation: string;
  id: string;
  options: readonly DemoOption[];
  prompt: string;
};

// Purpose-built UI fixture. It is unrelated to the private content library and
// must never be treated as secure answer validation or production game data.
export const syntheticDemoQuestions: readonly DemoQuestion[] = [
  {
    id: "ui-demo-01",
    prompt: "Choose the word that means ‘not noisy’.",
    options: [
      { id: "a", label: "quiet" },
      { id: "b", label: "bright" },
      { id: "c", label: "heavy" },
      { id: "d", label: "early" },
    ],
    correctOptionId: "a",
    explanation: "Quiet describes a place or sound with little or no noise.",
  },
  {
    id: "ui-demo-02",
    prompt: "Complete the sentence: She ___ coffee every morning.",
    options: [
      { id: "a", label: "drink" },
      { id: "b", label: "drinks" },
      { id: "c", label: "drinking" },
      { id: "d", label: "drank" },
    ],
    correctOptionId: "b",
    explanation:
      "Use drinks with she in the present simple because the sentence describes a regular habit. The third-person singular subject adds -s to the base verb in affirmative statements.",
  },
  {
    id: "ui-demo-03",
    prompt: "Which adjective is the opposite of generous?",
    options: [
      { id: "a", label: "patient" },
      { id: "b", label: "cheerful" },
      { id: "c", label: "selfish" },
      { id: "d", label: "careful" },
    ],
    correctOptionId: "c",
    explanation:
      "Selfish describes someone who mainly thinks about their own needs.",
  },
  {
    id: "ui-demo-04",
    prompt: "Choose the best word: The instructions were easy to understand.",
    options: [
      { id: "a", label: "ancient" },
      { id: "b", label: "clear" },
      { id: "c", label: "narrow" },
      { id: "d", label: "distant" },
    ],
    correctOptionId: "b",
    explanation: "Clear can mean easy to understand or follow.",
  },
  {
    id: "ui-demo-05",
    prompt: "Complete the sentence: We ___ the museum yesterday.",
    options: [
      { id: "a", label: "visit" },
      { id: "b", label: "visits" },
      { id: "c", label: "visited" },
      { id: "d", label: "visiting" },
    ],
    correctOptionId: "c",
    explanation: "Yesterday signals a completed past action, so use visited.",
  },
  {
    id: "ui-demo-06",
    prompt: "Which word best describes a person who stays calm?",
    options: [
      { id: "a", label: "composed" },
      { id: "b", label: "careless" },
      { id: "c", label: "crowded" },
      { id: "d", label: "fragile" },
    ],
    correctOptionId: "a",
    explanation: "Composed means calm and in control of your emotions.",
  },
  {
    id: "ui-demo-07",
    prompt: "Choose the word that best completes: Could you ___ that again?",
    options: [
      { id: "a", label: "repeat" },
      { id: "b", label: "borrow" },
      { id: "c", label: "arrive" },
      { id: "d", label: "invite" },
    ],
    correctOptionId: "a",
    explanation: "Repeat means to say or do something again.",
  },
  {
    id: "ui-demo-08",
    prompt: "Select the correct sentence.",
    options: [
      { id: "a", label: "They has finished." },
      { id: "b", label: "They have finish." },
      { id: "c", label: "They have finished." },
      { id: "d", label: "They finished have." },
    ],
    correctOptionId: "c",
    explanation:
      "The present perfect uses have plus the past participle: have finished.",
  },
  {
    id: "ui-demo-09",
    prompt: "Which adjective means able to change when needed?",
    options: [
      { id: "a", label: "adaptable" },
      { id: "b", label: "ordinary" },
      { id: "c", label: "silent" },
      { id: "d", label: "accurate" },
    ],
    correctOptionId: "a",
    explanation: "Adaptable describes someone or something able to adjust.",
  },
  {
    id: "ui-demo-10",
    prompt: "Complete the sentence: If it rains, we ___ inside.",
    options: [
      { id: "a", label: "stayed" },
      { id: "b", label: "stay" },
      { id: "c", label: "will stay" },
      { id: "d", label: "staying" },
    ],
    correctOptionId: "c",
    explanation:
      "In this first conditional, use will plus the base verb for the result.",
  },
];
