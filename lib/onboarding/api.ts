// Client for /api/onboarding, /api/interview and /api/knowledge-profile.
// Every call goes through useAuth().authorized(token => …) and the same-origin
// /api proxy: the browser never talks to a model provider.
import { request } from "@/lib/auth/api";
import type {
  AnswerAction,
  InterviewView,
  KnowledgeProfileView,
  OnboardingAnswers,
  OnboardingStatus,
  ReviewAction,
  UsageAnswer,
} from "./types";

export const onboardingApi = {
  status: (token: string) => request<OnboardingStatus>("/api/onboarding", { token }),
  /** INTRO_SEEN (intro finished or skipped), DEFER ("finish later"), RESUME (continue after deferring). */
  progress: (token: string, action: "INTRO_SEEN" | "DEFER" | "RESUME") =>
    request<OnboardingStatus>("/api/onboarding/progress", { method: "POST", body: { action }, token }),
  save: (token: string, answers: OnboardingAnswers) =>
    request<OnboardingAnswers>("/api/onboarding", { method: "PUT", body: answers, token }),

  /** The latest interview, or null (204) when there is none yet. */
  current: (token: string) => request<InterviewView | null>("/api/interview", { token }),
  start: (token: string, restart = false) =>
    request<InterviewView>("/api/interview", { method: "POST", body: { restart }, token }),
  get: (token: string, id: string) => request<InterviewView>(`/api/interview/${encodeURIComponent(id)}`, { token }),
  answer: (
    token: string,
    id: string,
    body: { turn: number; action: AnswerAction; answer?: string; usage?: UsageAnswer },
  ) => request<InterviewView>(`/api/interview/${encodeURIComponent(id)}/answer`, { method: "POST", body, token }),
  generateProfile: (token: string, id: string) =>
    request<KnowledgeProfileView>(`/api/interview/${encodeURIComponent(id)}/profile`, { method: "POST", token }),

  profile: (token: string) => request<KnowledgeProfileView>("/api/knowledge-profile", { token }),
  review: (token: string, body: { action: ReviewAction; competency?: string; note?: string }) =>
    request<KnowledgeProfileView>("/api/knowledge-profile/review", { method: "POST", body, token }),
};
