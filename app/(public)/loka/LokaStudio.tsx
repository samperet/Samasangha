"use client";

import { useState } from "react";
import LokaRecorder from "./LokaRecorder";
import LokaMixer from "./LokaMixer";

type Tab = "record" | "listen";

export default function LokaStudio({ backingUrl }: { backingUrl: string }) {
  const [tab, setTab] = useState<Tab>("record");

  return (
    <div>
      <div
        className="flex rounded-xl p-1 mb-8 max-w-sm mx-auto"
        style={{ background: "var(--parch-100)", border: "1px solid var(--surface-border)" }}
      >
        {(["record", "listen"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-lg text-sm font-semibold transition-colors"
            style={
              tab === t
                ? { background: "var(--gold-600)", color: "var(--fg-on-gold)" }
                : { color: "var(--fg2)" }
            }
          >
            {t === "record" ? "Add your voice" : "Listen together"}
          </button>
        ))}
      </div>

      {/* Both stay mounted so switching tabs doesn't tear down audio graphs;
          the inactive one is hidden. */}
      <div hidden={tab !== "record"}>
        <LokaRecorder backingUrl={backingUrl} onDone={() => setTab("listen")} />
      </div>
      <div hidden={tab !== "listen"}>
        <LokaMixer backingUrl={backingUrl} active={tab === "listen"} />
      </div>
    </div>
  );
}
