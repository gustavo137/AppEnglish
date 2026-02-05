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

function buildRound(verbs: VerbItem[], optionsCount: number): Round {
  const target = verbs[Math.floor(Math.random() * verbs.length)];
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

  React.useEffect(() => {
    loadVerbs()
      .then((v) => {
        setVerbs(v);
        setRound(buildRound(v, optionsCount));
      })
      .catch((e) => {
        console.error(e);
        setVerbs([]);
      });
  }, [optionsCount]);

  function next() {
    if (!verbs || verbs.length === 0) return;
    setPickedId(null);
    setRound(buildRound(verbs, optionsCount));
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
  const correct = pickedId === target.id;

  // <div className="row" style={{ alignItems: "stretch" }}> ==> <div className="quizLayout"> 
  return (
    <div className="card">
      <div className="quizLayout">
        <div style={{ flex: "1 1 380px", minWidth: 280 }}>
          <div className="imgWrap">
            <img
              src={normalizeImageUrl(target.image)}
              alt={target.infinitive}
              loading="lazy"
              onError={(e) => {
                // fallback if remote URL fails
                (e.currentTarget as HTMLImageElement).src =
                  "data:image/svg+xml;charset=utf-8," +
                  encodeURIComponent(
                    `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'>
                      <rect width='100%' height='100%' fill='#0b1220'/>
                      <text x='50%' y='50%' fill='#e5e7eb' font-size='48' font-family='system-ui' text-anchor='middle'>
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

          {pickedId && (
            <div style={{ marginTop: 12, opacity: 0.9 }}>
              {correct ? (
                <span className="badge">✅ Correct</span>
              ) : (
                <span className="badge">❌ Incorrect — correct is: {target.infinitive}</span>
              )}
            </div>
          )}

          <div style={{ marginTop: 12 }}>
            <button className="btn" onClick={next}>
              Next
            </button>
          </div>
        </div>

        <div style={{ flex: "1 1 380px", minWidth: 280 }}>
          <h2 style={{ margin: "0 0 10px", fontSize: 18 }}>Choose the verb</h2>
          <div style={{ display: "grid", gap: 10 }}>
            {options.map((v) => {
              const isPicked = pickedId === v.id;
              const isCorrect = v.id === target.id;
              const className =
                "btn " +
                (pickedId
                  ? isCorrect
                    ? "correct"
                    : isPicked
                      ? "wrong"
                      : ""
                  : "");
              return (
                <button
                  key={v.id}
                  className={className}
                  onClick={() => setPickedId(v.id)}
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
      </div>
    </div>
  );
}
