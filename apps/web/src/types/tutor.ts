/** Role of a participant in the tutor conversation. */
export type TutorMessage = {
  role: "user" | "assistant";
  content: string;
};

/**
 * What caused the tutor to be invoked.
 *
 * - `"student"` — student opened the chat themselves
 * - `"wrong-answer"` — triggered after an incorrect quick-check answer
 * - `"time-on-section"` — triggered after the student has been on a section too long
 * - `"failed-attempts"` — triggered after multiple failed attempts on a quick check
 */
export type TutorTrigger =
  | "student"
  | "wrong-answer"
  | "time-on-section"
  | "failed-attempts";

/** Shape of the request body for POST /api/tutor/chat */
export type TutorChatRequest = {
  message: string;
  lessonSlug: string;
  studentId: string;
  conversationHistory: TutorMessage[];
  triggeredBy?: TutorTrigger;
};

/**
 * JSON metadata appended after the streamed tutor reply.
 * Contains diagnostic context for the client to update intervention state.
 */
export type TutorChatResponse = {
  interventionTier: 2 | 3 | null;
  lessonSlug: string;
  teks: string[];
};
