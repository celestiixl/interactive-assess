"use client";

import { useEffect, useMemo, useState } from "react";

type ItemType =
  | "multiple_choice"
  | "multi_select"
  | "card_sort"
  | "diagram_label"
  | "evidence_pair"
  | "numeric_response";

type Difficulty = "easy" | "medium" | "hard";

type Item = {
  id: string;
  title: string;
  teks: string[];
  topic: string;
  gradeBand: "MS" | "HS";
  difficulty: Difficulty;
  staarStyle: boolean;
  itemType: ItemType;
  stimulus: any;
  prompt: string;
  choices?: { id: string; label: string }[];
  answer: any;
  misconceptionTags?: string[];
};

export default function ItemBankPage() {
  const [q, setQ] = useState("");
  const [teks, setTeks] = useState("");
  const [topic, setTopic] = useState("");
  const [type, setType] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("");
  const [staarStyle, setStaarStyle] = useState<string>("true");

  const [items, setItems] = useState<Item[]>([]);
  const [selected, setSelected] = useState<Item | null>(null);
  const [loading, setLoading] = useState(false);

  const url = useMemo(() => {
    const u = new URL("/api/item-bank", window.location.origin);
    if (q.trim()) u.searchParams.set("q", q.trim());
    if (teks.trim()) u.searchParams.set("teks", teks.trim());
    if (topic.trim()) u.searchParams.set("topic", topic.trim());
    if (type.trim()) u.searchParams.set("type", type.trim());
    if (difficulty.trim()) u.searchParams.set("difficulty", difficulty.trim());
    if (staarStyle.trim()) u.searchParams.set("staarStyle", staarStyle.trim());
    return u.toString();
  }, [q, teks, topic, type, difficulty, staarStyle]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(url, { cache: "no-store" });
        const data = await res.json();
        if (!alive) return;
        setItems(data.items ?? []);
        setSelected((prev) => {
          if (prev && (data.items ?? []).some((x: Item) => x.id === prev.id)) return prev;
          return (data.items ?? [])[0] ?? null;
        });
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [url]);

  const copyItem = async () => {
    if (!selected) return;
    await navigator.clipboard.writeText(JSON.stringify(selected, null, 2));
    alert("Copied item JSON to clipboard.");
  };

  const addToAssignment = async () => {
    if (!selected) return;
    // Placeholder: wire this into your assignment builder store/action later.
    // For now, we copy JSON so teachers can paste into an assignment editor.
    await copyItem();
  };

  return (
    <div style={{ padding: 24, display: "grid", gridTemplateColumns: "380px 1fr", gap: 16 }}>
      <div style={{ border: "1px solid rgba(0,0,0,0.12)", borderRadius: 14, padding: 14, background: "white" }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>Item Bank</div>

        <div style={{ display: "grid", gap: 10 }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search (keywords, misconceptions, etc.)" style={inp} />
          <input value={teks} onChange={(e) => setTeks(e.target.value)} placeholder="TEKS (ex: BIO.7B)" style={inp} />
          <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic (ex: Gene Expression)" style={inp} />

          <select value={type} onChange={(e) => setType(e.target.value)} style={inp}>
            <option value="">All item types</option>
            <option value="multiple_choice">Multiple Choice</option>
            <option value="multi_select">Multi Select</option>
            <option value="card_sort">Card Sort</option>
            <option value="diagram_label">Diagram Label</option>
            <option value="evidence_pair">2-Part Evidence</option>
            <option value="numeric_response">Numeric Response</option>
          </select>

          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} style={inp}>
            <option value="">All difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <select value={staarStyle} onChange={(e) => setStaarStyle(e.target.value)} style={inp}>
            <option value="true">STAAR style only</option>
            <option value="false">Non-STAAR style</option>
            <option value="">All</option>
          </select>
        </div>

        <div style={{ marginTop: 14, fontSize: 13, opacity: 0.7 }}>
          {loading ? "Loading…" : `${items.length} item(s)`}
        </div>

        <div style={{ marginTop: 12, display: "grid", gap: 10, maxHeight: "62vh", overflow: "auto", paddingRight: 6 }}>
          {items.map((it) => (
            <button
              key={it.id}
              onClick={() => setSelected(it)}
              style={{
                textAlign: "left",
                border: "1px solid rgba(0,0,0,0.12)",
                borderRadius: 12,
                padding: 10,
                background: selected?.id === it.id ? "rgba(0,0,0,0.04)" : "white",
                cursor: "pointer"
              }}
            >
              <div style={{ fontWeight: 650 }}>{it.title}</div>
              <div style={{ fontSize: 12, opacity: 0.75 }}>
                {it.itemType} • {it.difficulty} • {it.topic} • {it.teks.join(", ")}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ border: "1px solid rgba(0,0,0,0.12)", borderRadius: 14, padding: 16, background: "white" }}>
        {!selected ? (
          <div style={{ opacity: 0.7 }}>Select an item to preview.</div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 750 }}>{selected.title}</div>
                <div style={{ fontSize: 13, opacity: 0.75 }}>
                  {selected.itemType} • {selected.difficulty} • {selected.topic} • {selected.teks.join(", ")}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={copyItem} style={btn}>Copy JSON</button>
                <button onClick={addToAssignment} style={btnStrong}>Add to assignment</button>
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Prompt</div>
              <div style={{ lineHeight: 1.4 }}>{selected.prompt}</div>
            </div>

            {selected.stimulus?.kind === "text" ? (
              <div style={{ marginTop: 14, padding: 12, borderRadius: 12, background: "rgba(0,0,0,0.03)" }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Stimulus</div>
                <div style={{ lineHeight: 1.4 }}>{selected.stimulus.text}</div>
              </div>
            ) : null}

            {Array.isArray(selected.choices) ? (
              <div style={{ marginTop: 14 }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Choices</div>
                <div style={{ display: "grid", gap: 8 }}>
                  {selected.choices.map((c) => (
                    <div key={c.id} style={{ border: "1px solid rgba(0,0,0,0.10)", borderRadius: 10, padding: 10 }}>
                      <span style={{ fontWeight: 800, marginRight: 8 }}>{c.id}</span>
                      {c.label}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {selected.misconceptionTags?.length ? (
              <div style={{ marginTop: 14 }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Misconception tags</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {selected.misconceptionTags.map((t) => (
                    <span
                      key={t}
                      style={{
                        border: "1px solid rgba(0,0,0,0.14)",
                        borderRadius: 999,
                        padding: "6px 10px",
                        fontSize: 12,
                        opacity: 0.85
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

const inp: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.16)",
  outline: "none"
};

const btn: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 999,
  border: "1px solid rgba(0,0,0,0.18)",
  background: "white",
  cursor: "pointer",
  fontWeight: 650
};

const btnStrong: React.CSSProperties = {
  ...btn,
  border: "1px solid rgba(0,0,0,0.28)",
  fontWeight: 800
};
