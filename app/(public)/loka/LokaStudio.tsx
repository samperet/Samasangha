"use client";

import { useState } from "react";
import LokaRecorder from "./LokaRecorder";
import LokaPrayerWheel from "./LokaPrayerWheel";

type Tab = "record" | "listen";

export default function LokaStudio({
  backingUrl,
  initialCount,
  goal,
}: {
  backingUrl: string;
  initialCount: number;
  goal: number;
}) {
  const [tab, setTab] = useState<Tab>("record");

  return (
    <div>
      <div
        className="flex rounded-full p-1 mb-8 mx-auto"
        style={{ background: "var(--parch-100)", border: "1px solid var(--surface-border)", maxWidth: "26rem" }}
      >
        {([
          { t: "record" as Tab, label: "Add my voice" },
          { t: "listen" as Tab, label: "The prayer wheel" },
        ]).map(({ t, label }) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-3 rounded-full font-semibold transition-colors"
            style={
              tab === t
                ? { background: "var(--gold-600)", color: "var(--fg-on-gold)", fontSize: "1.05rem" }
                : { color: "var(--fg2)", fontSize: "1.05rem" }
            }
          >
            {label}
          </button>
        ))}
      </div>

      <div hidden={tab !== "record"}>
        <LokaRecorder backingUrl={backingUrl} goal={goal} onDone={() => setTab("listen")} />
      </div>
      <div hidden={tab !== "listen"}>
        <LokaPrayerWheel backingUrl={backingUrl} goal={goal} initialCount={initialCount} active={tab === "listen"} />
      </div>
    </div>
  );
}
