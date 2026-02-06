import React from "react";
import type { VerbItem } from "./types";
import { loadVerbs, normalizeImageUrl, pickN } from "./verbs";

type Props = {
  optionsCount: number; // e.g. 4
};

type Round = {
  target: VerbItem;
  options: VerbItem[];
};

type Stats = {
  total: number;
  correct: number;
  hitCount: Record<string, number>;
  missCount: Record<string, number>;
  lastUpdated: number;
};

const STATS_KEY = "appenglish.quizImage.stats.v1";

function defaultStats(): Stats {
  return {
    total: 0,
    correct: 0,
    hitCount: {},
    missCount: {},
    lastUpdated: Date.now(),
  };
}

function loadStats(): Stats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return defaultStats();
    const parsed = JSON.parse(raw) as Partial<Stats>;
    return {
      total: typeof parsed.total === "number" ? parsed.total : 0,
      correct: typeof parsed.correct === "number" ? parsed.correct : 0,
      hitCount: parsed.hitCount && typeof parsed.hitCount === "object" ? parsed.hitCount : {},
      missCount: parsed.missCount && typeof parsed.missCount === "object" ? parsed.missCount : {},
      lastUpdated: typeof parsed.lastUpdated === "number" ? parsed.lastUpdated : Date.now(),
    };
  } catch {
    return defaultStats();
  }
}

function saveStats(s: Stats) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(s));
  } catch {
    // ignore (private mode / quota)
  }
}

function clampMin1(x: number) {
  return x < 1 ? 1 : x;
}

function pickWeighted(verbs: VerbItem[], hit: Record<string, number>, miss: Record<string, number>, avoidId?: string) {
  // Weight heuristic:
  // - base weight 1
  // - mistakes increase probability strongly
  // - repeated hits reduce it mildly
  const weights = verbs.map((v) => {
    const h = hit[v.id] ?? 0;
    const m = miss[v.id] ?? 0;
    let w = 1 + 3 * m - 0.5 * h;
    if (avoidId && v.id === avoidId) w *= 0.15; // avoid immediate repeats without forbidding them
    return clampMin1(w);
  });

  const sum = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * sum;

  for (let i = 0; i < verbs.length; i++) {
    r -= weights[i];
    if (r <= 0) return verbs[i];
  }
  return verbs[verbs.length - 1];
}

function buildRoundWeighted(
  verbs: VerbItem[],
  optionsCount: number,
  hit: Record<string, number>,
  miss: Record<string, number>,
  avoidId?: string
): Round {
  const target = pickWeighted(verbs, hit, miss, avoidId);
  const distractors = pickN(
    verbs.filter((v) => v.id !== target.id),
    Math.max(1, optionsCount - 1)
  );
  const options = pickN([target, ...distractors], optionsCount);
  return { target, options };
}

export default function QuizImageMode({ optionsCount }: Props) {
  const [verbs, setVerbs] = React.useState<VerbItem[] | null>(null);
  const [round, setRound] = React.useState<Round | null>(null);
  const [pickedId, setPickedId] = React.useState<string | null>(null);

  // persistent stats
  const [stats, setStats] = React.useState<Stats>(() => {
    // localStorage only exists in browser
    if (typeof window === "undefined") return defaultStats();
    return loadStats();
  });

  // keep localStorage synced
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    saveStats(stats);
  }, [stats]);

  React.useEffect(() => {
    loadVerbs()
      .then((v) => {
        setVerbs(v);
        // first round: no avoidId
        setRound(buildRoundWeighted(v, optionsCount, stats.hitCount, stats.missCount));
      })
      .catch((e) => {
        console.error(e);
        setVerbs([]);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optionsCount]);

  function next() {
    if (!verbs || verbs.length === 0) return;
    const avoidId = round?.target?.id;
    setPickedId(null);
    setRound(buildRoundWeighted(verbs, optionsCount, stats.hitCount, stats.missCount, avoidId));
  }

  function resetStats() {
    const s = defaultStats();
    setStats(s);
    try {
      localStorage.removeItem(STATS_KEY);
    } catch {
      // ignore
    }
  }

  function onPick(id: string) {
    if (!round || pickedId) return; // already answered
    setPickedId(id);

    const targetId = round.target.id;
    const isCorrect = id === targetId;

    setStats((prev) => {
      const nextStats: Stats = {
        ...prev,
        total: prev.total + 1,
        correct: prev.correct + (isCorrect ? 1 : 0),
        hitCount: { ...prev.hitCount },
        missCount: { ...prev.missCount },
        lastUpdated: Date.now(),
      };

      if (isCorrect) {
        nextStats.hitCount[targetId] = (nextStats.hitCount[targetId] ?? 0) + 1;
      } else {
        nextStats.missCount[targetId] = (nextStats.missCount[targetId] ?? 0) + 1;
      }
      return nextStats;
    });
  }

  if (verbs === null || round === null) {
    return <div className="card">Loading verbs…</div>;
  }

  if (verbs.length === 0) {
    return (
      <div className="card">
        <strong>Could not load verbs.</strong>
        <div style={{ marginTop: 8, opacity: 0.85 }}>
          Check that <code>public/verbs.json</code> exists and is valid JSON.
        </div>
      </div>
    );
  }

  const { target, options } = round;
  const isAnswered = !!pickedId;
  const isCorrect = pickedId === target.id;
  const accuracy = stats.total > 0 ? Math.round((100 * stats.correct) / stats.total) : 0;

  const hardest = Object.entries(stats.missCount)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="card">
      {/* top bar */}
      <div style={{ display: "flex", gap: 10, justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <span className="badge">Mode: Image → Verb</span>
          <span className="badge">
            Score: {stats.correct}/{stats.total} ({accuracy}%)
          </span>
        </div>

        <button className="btn" onClick={resetStats} style={{ width: "auto", padding: "10px 12px" }}>
          Reset stats
        </button>
      </div>

      <div className="quizLayout" style={{ marginTop: 12 }}>
        {/* IMAGE + BADGES */}
        <div className="quizImageBlock">
          <div className="imgWrap">
            <img
              src={normalizeImageUrl(target.image_local ?? target.image)}
              alt={target.infinitive}
              loading="lazy"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  "data:image/svg+xml;charset=utf-8," +
                  encodeURIComponent(
                    `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'>
                <rect width='100%' height='100%' fill='#0b1220'/>
                <text x='50%' y='50%' fill='#e5e7eb' font-size='48'
                      font-family='system-ui' text-anchor='middle'>
                  image unavailable
                </text>
              </svg>`
                  );
              }}
            />
          </div>

          <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <span className="badge">ES: {target.spanish}</span>
            <span className="badge">Target: infinitive</span>
          </div>
        </div>

        {/* OPTIONS */}
        <div className="quizOptions">
          <h2 style={{ margin: "0 0 10px", fontSize: 18 }}>Choose the verb</h2>

          <div style={{ display: "grid", gap: 10 }}>
            {options.map((v) => {
              const picked = pickedId === v.id;
              const correctOption = v.id === target.id;

              const className =
                "btn " +
                (pickedId ? (correctOption ? "correct" : picked ? "wrong" : "") : "");

              return (
                <button
                  key={v.id}
                  className={className}
                  onClick={() => onPick(v.id)}
                  disabled={!!pickedId}
                >
                  <div style={{ fontSize: 16, fontWeight: 600 }}>{v.infinitive}</div>
                  <div style={{ opacity: 0.8, fontSize: 12 }}>
                    past: {v.past} • pp: {v.past_participle} • gerund: {v.gerund}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* FEEDBACK + STATS + NEXT */}
        <div className="quizFeedback">
          {pickedId && (
            <div style={{ marginTop: 12, opacity: 0.9 }}>
              {pickedId === target.id ? (
                <span className="badge">✅ Correct</span>
              ) : (
                <span className="badge">❌ Incorrect — correct is: {target.infinitive}</span>
              )}
            </div>
          )}

          {hardest.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ marginBottom: 8, opacity: 0.9 }}>Hardest (most missed)</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {hardest.map(([id, n]) => (
                  <span key={id} className="badge">
                    {id.replace(/^to_/, "")}: {n}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: 12 }}>
            <button className="btn" onClick={next} disabled={!pickedId}>
              Next
            </button>
          </div>
        </div>
      </div>



    </div>
  );
}
