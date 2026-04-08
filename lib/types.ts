export type Message = {
  id?: string;
  role: "user" | "assistant";
  content: string;
};

export type Problem = {
  id: string;
  title: string;
  situation: string;
  answer: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
};

export type GameState = {
  status: "playing" | "solved";
  hintsUsed: number;
};

export type Action = "question" | "hint" | "solve";
