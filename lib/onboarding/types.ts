// Shapes of the onboarding / interview / Knowledge Profile API (learning-app:
// OnboardingController, InterviewController, KnowledgeProfileController).

export interface OnboardingAnswers {
  about: { duration: string | null; level: string | null; goal: string | null; goalOther: string | null };
  tech: { selected: string[]; custom: string[] };
  experience: {
    built: string | null;
    projectName: string | null;
    projectDescription: string | null;
    noTutorial: string | null;
    stuck: string[];
    extra: string | null;
  };
}

export type OnboardingStage = "INTAKE" | "INTERVIEW" | "PROFILE_PENDING" | "PROFILE_READY" | "CONFIRMED";

export interface OnboardingStatus {
  stage: OnboardingStage;
  answers: OnboardingAnswers | null;
  answersComplete: boolean;
  assessmentId: string | null;
  profileId: string | null;
}

export type CompetencyId =
  | "html-css"
  | "javascript"
  | "async-javascript"
  | "react"
  | "typescript"
  | "nextjs"
  | "frontend-practices";

export interface CompetencyProgress {
  id: CompetencyId;
  name: string;
  status: "pending" | "active" | "finished" | "skipped";
  questions: number;
  path: string[];
  skipReason: string | null;
  usageCheck: boolean;
}

export interface ThreadItem {
  type: "lead" | "question" | "usage_check" | "answer" | "system" | "end";
  seq: number;
  competency: CompetencyId | null;
  text: string | null;
  difficulty: string | null;
  questionType: string | null;
  code: string | null;
  codeLanguage: string | null;
  codeFile: string | null;
  answerKind: "ANSWER" | "UNSURE" | "SKIP" | "USAGE" | null;
  usage: string | null;
  reason: string | null;
}

export interface CurrentTurn {
  turn: number;
  kind: "question" | "usage_check";
  competency: CompetencyId;
  difficulty: string | null;
  questionType: string | null;
  question: string | null;
  code: string | null;
  codeLanguage: string | null;
  codeFile: string | null;
  savedAnswer: string | null;
}

export interface InterviewView {
  id: string;
  status: "IN_PROGRESS" | "INTERVIEW_COMPLETE" | "PROFILE_READY" | "ABANDONED";
  processing: boolean;
  lastError: string | null;
  questionsAsked: number;
  maxQuestions: number;
  competencies: CompetencyProgress[];
  thread: ThreadItem[];
  current: CurrentTurn | null;
  profileId: string | null;
}

export type AnswerAction = "ANSWER" | "UNSURE" | "SKIP" | "USAGE";
export type UsageAnswer = "NEVER" | "TRIED" | "USED";

export type Level = "unknown" | "not_demonstrated" | "practicing" | "proficient" | "mastered";
export type ConfidenceLevel = "low" | "medium" | "high";

export interface CompetencyProfile {
  id: CompetencyId;
  name: string;
  level: Level;
  confidence: ConfidenceLevel;
  demonstratedSkills: string[];
  weaknesses: string[];
  misconceptions: string[];
  evidenceSummary: string;
  untestedSubskills: { id: string; label: string }[];
  nextLearningDirection: string;
  status: "assessed" | "not_used_yet" | "prerequisite_not_met" | "skipped_by_candidate" | "not_reached";
  claim: { selected: boolean; usage: string | null; label: string };
  evidence: { seq: number; question: string | null; difficulty: string | null; questionType: string | null; outcome: string }[];
}

export interface ProfileDocument {
  version: number;
  assessmentId: string;
  generatedAt: string;
  overallSummary: string;
  currentStage: string;
  strengths: string[];
  knowledgeGaps: string[];
  learningPriorities: { topic: string; competency: CompetencyId; reason: string }[];
  roadmap: {
    strongAreas: string[];
    developmentPriorities: string[];
    unknownAreas: string[];
    recommendedStartingDifficulty: string;
    evidenceCoverage: string;
  };
  competencies: CompetencyProfile[];
  stats: { questionsAnswered: number; competenciesAssessed: number; escalations: number };
}

export interface KnowledgeProfileView {
  id: string;
  assessmentId: string;
  createdAt: string;
  confirmed: boolean;
  confirmedAt: string | null;
  profile: ProfileDocument;
  originalLevels: Record<string, Level>;
  review: Record<string, { verdict: string; note: string | null; flagged: boolean; outcome: string }>;
  reviewLog: { competency: string | null; action: string; from: string | null; to: string | null; at: string }[];
}

export type ReviewAction = "AGREE" | "LOWER" | "DONT_KNOW" | "NOTE" | "MORE" | "FLAG" | "CONFIRM";
