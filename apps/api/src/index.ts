import Fastify from "fastify";
import fastifyCors from "@fastify/cors";

const app = Fastify();
app.register(fastifyCors as any, { origin: true });

type Attempt = {
  userId: string;
  itemId: string;
  type: "mcq" | "drag" | "hotspot" | "cardsort" | "scr";
  payload: any;
  score: number;
  maxScore: number;
  tries: number;
  ts: number;
};

const attempts: Attempt[] = [];

// --- health
app.get("/health", async () => ({ ok: true }));

// --- save attempt
app.post("/attempts", async (req, reply) => {
  const body = (req.body ?? {}) as Partial<Attempt>;
  if (!body.userId || !body.itemId) {
    reply.code(400);
    return { ok: false, error: "userId and itemId required" };
  }
  const record: Attempt = {
    userId: body.userId!,
    itemId: body.itemId!,
    type: (body.type as any) ?? "mcq",
    payload: body.payload ?? {},
    score: Number(body.score ?? 0),
    maxScore: Number(body.maxScore ?? 1),
    tries: Number(body.tries ?? 1),
    ts: Date.now(),
  };
  attempts.push(record);

  // simple redo hint
  const userItem = attempts.filter(
    (a) => a.userId === record.userId && a.itemId === record.itemId,
  );
  const wrongCount = userItem.filter((a) => a.score < a.maxScore).length;
  const redo = record.score < record.maxScore && wrongCount >= 2;

  return { ok: true, redo, wrongCount };
});

// --- list attempts (optionally by userId)
app.get("/attempts", async (req) => {
  const { userId } = (req.query as any) ?? {};
  const rows = userId ? attempts.filter((a) => a.userId === userId) : attempts;
  return { ok: true, attempts: rows };
});

// --- redo items for a user
app.get("/redo", async (req) => {
  const { userId } = (req.query as any) ?? {};
  if (!userId) return { ok: true, items: [] };
  const byItem = new Map<string, Attempt[]>();
  attempts
    .filter((a) => a.userId === userId)
    .forEach((a) => byItem.set(a.itemId, [...(byItem.get(a.itemId) ?? []), a]));
  const redoItems = [...byItem.entries()]
    .filter(
      ([_, arr]) => arr[arr.length - 1].score < arr[arr.length - 1].maxScore,
    ) // latest wrong
    .filter(([_, arr]) => arr.filter((r) => r.score < r.maxScore).length >= 2) // >=2 wrongs total
    .map(([itemId]) => itemId);
  return { ok: true, items: redoItems };
});

// --- ALEKS-like progress using LATEST attempt per item
// body: { userId, itemIds: string[], baseRequired?: number, penaltyPerWrong?: number }
app.post("/assignment/progress", async (req, reply) => {
  const body = (req.body ?? {}) as {
    userId?: string;
    itemIds?: string[];
    baseRequired?: number;
    penaltyPerWrong?: number;
  };
  const userId = body.userId ?? "";
  const ids = body.itemIds ?? [];
  if (!userId || ids.length === 0) {
    reply.code(400);
    return { ok: false, error: "userId and itemIds required" };
  }
  const baseRequired = Number.isFinite(body.baseRequired)
    ? Number(body.baseRequired)
    : 5; // C
  const penaltyPerWrong = Number.isFinite(body.penaltyPerWrong)
    ? Number(body.penaltyPerWrong)
    : 1; // P

  // latest per item
  const latestByItem = new Map<
    string,
    { score: number; max: number; ts: number }
  >();
  for (const a of attempts) {
    if (a.userId !== userId) continue;
    if (!ids.includes(a.itemId)) continue;
    const prev = latestByItem.get(a.itemId);
    if (!prev || a.ts > prev.ts)
      latestByItem.set(a.itemId, { score: a.score, max: a.maxScore, ts: a.ts });
  }

  const latest = [...latestByItem.values()];
  const correct = latest.filter((x) => x.score >= x.max).length;
  const wrong = latest.filter((x) => x.score < x.max).length;

  const required = baseRequired + wrong * penaltyPerWrong; // C + wrong×P
  const remaining = Math.max(required - correct, 0);
  const accuracy = latest.length ? correct / latest.length : 0;

  return {
    ok: true,
    baseRequired,
    penaltyPerWrong,
    correct,
    wrong,
    required,
    remaining,
    consideredItems: latest.length,
    done: remaining === 0,
  };
});

const port = Number(process.env.PORT || 3001);
app
  .listen({ port, host: "0.0.0.0" })
  .then(() => console.log("API listening on", port))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
