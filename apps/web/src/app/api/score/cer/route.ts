import { NextRequest, NextResponse } from "next/server";
import type { CerResponse } from "@/types/item";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { item, response }: { item: any; response: CerResponse } = body;

    if (!item || !response) {
      return NextResponse.json(
        { error: "Missing item or response" },
        { status: 400 },
      );
    }

    // Auto-score evidence selection if correctEvidenceIds is defined
    const autoScore: any = {
      evidence: 0,
      totalAuto: item.rubric?.evidencePoints ?? 2,
      feedback: [],
    };

    if (item.correctEvidenceIds && Array.isArray(item.correctEvidenceIds)) {
      const correctCount = response.selectedEvidenceIds.filter((id) =>
        item.correctEvidenceIds.includes(id),
      ).length;

      autoScore.evidence = correctCount;

      // Generate feedback based on evidence selection
      const feedback: string[] = [];

      // Check if student selected correct evidence
      const correctlySelectedCount = response.selectedEvidenceIds.filter((id) =>
        item.correctEvidenceIds.includes(id),
      ).length;

      const incorrectlySelectedCount = response.selectedEvidenceIds.filter(
        (id) => !item.correctEvidenceIds.includes(id),
      ).length;

      if (incorrectlySelectedCount > 0) {
        feedback.push(
          `You selected ${incorrectlySelectedCount} piece(s) of evidence that don't support the claim.`,
        );
      }

      const missedCount =
        item.correctEvidenceIds.length - correctlySelectedCount;
      if (missedCount > 0) {
        feedback.push(
          `You missed ${missedCount} piece(s) of supporting evidence.`,
        );
      }

      // Check for evidence types
      const supportingCount = response.selectedEvidenceIds.filter((id) => {
        const ev = item.evidenceBank.find((e: any) => e.id === id);
        return ev?.tag === "supports";
      }).length;

      if (supportingCount === 0 && response.selectedEvidenceIds.length > 0) {
        feedback.push(
          "Consider selecting evidence that directly supports your claim.",
        );
      }

      if (feedback.length) {
        autoScore.feedback = feedback;
      }
    } else {
      // If no correct answer key, just validate constraints
      const minEvidence = item.constraints?.minEvidence ?? 1;
      const maxEvidence = item.constraints?.maxEvidence ?? 3;

      if (response.selectedEvidenceIds.length < minEvidence) {
        autoScore.feedback.push(
          `Select at least ${minEvidence} piece(s) of evidence.`,
        );
      }

      if (response.selectedEvidenceIds.length > maxEvidence) {
        autoScore.feedback.push(
          `Select no more than ${maxEvidence} piece(s) of evidence.`,
        );
      }

      const reasoningMinChars = item.constraints?.reasoningMinChars ?? 60;
      if (response.reasoningText.length < reasoningMinChars) {
        autoScore.feedback.push(
          `Reasoning should be at least ${reasoningMinChars} characters.`,
        );
      }
    }

    return NextResponse.json({
      ok: true,
      autoScore,
      response,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Scoring failed" },
      { status: 500 },
    );
  }
}
