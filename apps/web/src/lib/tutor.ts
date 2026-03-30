/**
 * tutor.ts
 *
 * Pure helpers for assembling the BioSpark Tutor system prompt.
 * No I/O, no side effects. Fully testable.
 */

import type { LearningLesson } from "@/lib/learningHubContent";
import type { TutorTrigger } from "@/types/tutor";

/**
 * Build the system prompt for the BioSpark AI Tutor.
 *
 * @param lesson          The `LearningLesson` the student is currently working on.
 *                        Used to populate lesson title, TEKS codes, and known
 *                        misconceptions.
 * @param learningLevel   The student's current qualitative mastery level:
 *                        `"developing"`, `"progressing"`, `"proficient"`, or
 *                        `"advanced"`. Passed directly into the prompt so the
 *                        model can calibrate its explanations.
 * @param interventionTier The active intervention tier for this student:
 *                        `2` (targeted support), `3` (intensive support), or
 *                        `null` (no intervention needed). Controls the warmth
 *                        and scaffolding level of the tutor's tone.
 * @param triggeredBy     Optional. What caused the tutor to open. Informs the
 *                        tutor's opening move: encouragement after a wrong
 *                        answer, extra warmth after failed attempts, or a
 *                        gentle check-in after time on section.
 * @returns A complete system prompt string ready to pass to the Anthropic API.
 */
export function buildTutorSystemPrompt(
  lesson: LearningLesson,
  learningLevel: string,
  interventionTier: 2 | 3 | null,
  triggeredBy?: TutorTrigger,
): string {
  const teksStr = (lesson.teks ?? []).join(", ");
  const firstTeks = lesson.teks?.[0] ?? "the current TEKS standard";

  const misconceptions = lesson.lessonMisconceptions ?? [];
  const misconceptionList =
    misconceptions.length > 0
      ? misconceptions.map((m, i) => `${i + 1}. ${m}`).join("\n")
      : "1. No specific misconceptions listed for this lesson.";

  const triggerInstructions = buildTriggerInstructions(triggeredBy);

  return `You are BioSpark Tutor, a friendly and patient biology coach for 9th grade students at Willowridge High School in Houston, TX.

You are helping a student with this lesson: ${lesson.title}
TEKS being studied: ${teksStr}
Student learning level: ${learningLevel}

Known misconceptions students commonly have in this lesson:
${misconceptionList}

Your rules. Follow ALL of these in every single response:
- Ask a guiding question before giving a direct answer whenever possible.
- NEVER directly answer a quick check or quiz question. Redirect warmly instead.
- Use everyday language first, then introduce content-specific terms.
- Keep responses short: 2 to 3 sentences maximum unless the student explicitly asks for more.
- If the student seems frustrated or stuck, acknowledge their feeling before explaining anything.
- If the student goes off topic, redirect warmly. Say something like: That is a great question! For now let us focus on ${firstTeks}. You can explore that after the lesson.
- NEVER use em dashes in any response. Replace them with commas, short sentences, or periods.
- NEVER use the phrases 'I cannot help with that' or 'that is outside my scope'. Always redirect warmly.
- Write like you are talking to a curious 9th grader, not writing an essay.
- Use 'we' and 'let us' language to feel collaborative, not authoritative.
${triggerInstructions}`;
}

/**
 * Build the trigger-specific instruction line appended to the system prompt.
 *
 * @param triggeredBy What caused the tutor session to open.
 * @returns A string with the relevant instruction line, or an empty string
 *          when no special trigger applies.
 */
function buildTriggerInstructions(
  triggeredBy: TutorTrigger | undefined,
): string {
  switch (triggeredBy) {
    case "wrong-answer":
      return "- If triggeredBy is 'wrong-answer': open with genuine encouragement, then offer a hint. Never give the answer directly.";
    case "failed-attempts":
      return "- If triggeredBy is 'failed-attempts': be extra warm and offer to break the concept into smaller steps.";
    case "time-on-section":
      return "- If triggeredBy is 'time-on-section': check in gently. Ask what part feels confusing rather than assuming.";
    default:
      return "";
  }
}
