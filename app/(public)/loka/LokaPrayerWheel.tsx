"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  audioBufferToWav,
  CHANT_TRANSLATION,
  fetchAudioBuffer,
  type Recording,
} from "./loka-shared";

const CX = 200;
const CY = 200;
const R = 165;

export default function LokaPrayerWheel({
  backingUrl,
  goal,
  initialCount,
  active,
}: {
  backingUrl: string;
  goal: number;
  initialCount: number;
  active: boolean;
}) {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [listState, setListState] = useState<"loading" | "ready" | "error">("loading");
  const [preparing, setPreparing] = useState(false);
  const [prepError, setPrepError] = useState("");
  const [playing, setPlaying] = useState(false);
  const [soloIds, setSoloIds] = useState<string[]>([]);
  const [groupOn, setGroupOn] = useState<{ HIGHER: boolean; LOWER: boolean }>({ HIGHER: true, LOWER: true });
  const [nudgeMs, setNudgeMs] = useState(0);
  const [downloading, setDownloading] = useState(false);

  const ctxRef = useRef<AudioContext | null>(null);
  const backingBufRef = useRef<AudioBuffer | null>(null);
  const buffersRef = useRef<Map<string, AudioBuffer>>(new Map());
  const masterRef = useRef<GainNode | null>(null);
  const trackGainRef = useRef<Map<string, GainNode>>(new Map());
  const sourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const startRef = useRef(0);
  const totalRef = useRef(0);
  const rafRef = useRef(0);

  const loadList = useCallback(() => {
    fetch("/api/loka/recordings")
      .then((r) => r.json())
      .then((data: Recording[]) => {
        setRecordings(data);
        setListState("ready");
      })
      .catch(() => setListState("error"));
  }, []);

  // Load on mount, and refresh each time the prayer-wheel tab is opened so a
  // just-submitted voice shows up.
  useEffect(() => {
    loadList();
  }, [loadList]);
  useEffect(() => {
    if (active) loadList();
  }, [active, loadList]);

  const count = Math.max(initialCount, recordings.length);
  const higher = recordings.filter((r) => r.voiceType === "HIGHER");
  const lower = recordings.filter((r) => r.voiceType === "LOWER");

  const effectiveGain = useCallback(
    (r: Recording) => {
      const anySolo = soloIds.length > 0;
      if (anySolo) return soloIds.includes(r.id) ? 1 : 0;
      return groupOn[r.voiceType] ? 1 : 0;
    },
    [soloIds, groupOn]
  );

  // Live-apply toggles while playing.
  useEffect(() => {
    if (!playing || !ctxRef.current) return;
    const t = ctxRef.current.currentTime;
    recordings.forEach((r) => {
      const g = trackGainRef.current.get(r.id);
      if (g) g.gain.setTargetAtTime(effectiveGain(r), t, 0.03);
    });
  }, [playing, recordings, effectiveGain]);

  const ensureCtx = useCallback(() => {
    if (!ctxRef.current) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctxRef.current = new AC();
    }
    return ctxRef.current;
  }, []);

  const prepare = useCallback(async () => {
    const ctx = ensureCtx();
    await ctx.resume();
    if (!backingBufRef.current) backingBufRef.current = await fetchAudioBuffer(ctx, backingUrl);
    for (const r of recordings) {
      if (!buffersRef.current.has(r.id)) {
        try {
          buffersRef.current.set(r.id, await fetchAudioBuffer(ctx, r.audioUrl));
        } catch {
          /* skip */
        }
      }
    }
  }, [ensureCtx, recordings, backingUrl]);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    sourcesRef.current.forEach((s) => {
      try {
        s.stop();
      } catch {
        /* noop */
      }
    });
    sourcesRef.current = [];
    trackGainRef.current.clear();
    setPlaying(false);
  }, []);

  const play = useCallback(async () => {
    setPrepError("");
    try {
      setPreparing(true);
      await prepare();
      setPreparing(false);
    } catch {
      setPreparing(false);
      setPrepError("The prayer isn't ready just yet. Please try again in a little while.");
      return;
    }
    const ctx = ctxRef.current!;
    const backing = backingBufRef.current!;
    const nudge = nudgeMs / 1000;

    const master = ctx.createGain();
    master.gain.value = 1;
    master.connect(ctx.destination);
    masterRef.current = master;

    const start = ctx.currentTime + 0.15;
    startRef.current = start;
    const sources: AudioBufferSourceNode[] = [];

    const bGain = ctx.createGain();
    bGain.gain.value = 0.85;
    bGain.connect(master);
    const bSrc = ctx.createBufferSource();
    bSrc.buffer = backing;
    bSrc.connect(bGain);
    bSrc.start(start);
    sources.push(bSrc);

    let total = backing.duration;

    recordings.forEach((r) => {
      const buf = buffersRef.current.get(r.id);
      if (!buf) return;
      const g = ctx.createGain();
      g.gain.value = effectiveGain(r);
      g.connect(master);
      trackGainRef.current.set(r.id, g);
      const s = ctx.createBufferSource();
      s.buffer = buf;
      s.connect(g);
      const desired = start + (r.startMs + r.offsetMs) / 1000 + nudge;
      if (desired >= ctx.currentTime) s.start(desired);
      else s.start(ctx.currentTime, ctx.currentTime - desired);
      sources.push(s);
      total = Math.max(total, (r.startMs + r.offsetMs) / 1000 + nudge + buf.duration);
    });

    sourcesRef.current = sources;
    totalRef.current = total;
    setPlaying(true);

    const tick = () => {
      const elapsed = ctx.currentTime - startRef.current;
      if (elapsed >= totalRef.current) {
        stop();
        play(); // a prayer wheel keeps turning
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [prepare, recordings, effectiveGain, nudgeMs, stop]);

  useEffect(() => {
    if (!active && playing) stop();
  }, [active, playing, stop]);
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  async function downloadMix() {
    setDownloading(true);
    setPrepError("");
    try {
      await prepare();
      const backing = backingBufRef.current!;
      const nudge = nudgeMs / 1000;
      const sr = backing.sampleRate;
      let total = backing.duration;
      recordings.forEach((r) => {
        const buf = buffersRef.current.get(r.id);
        if (buf) total = Math.max(total, (r.startMs + r.offsetMs) / 1000 + nudge + buf.duration);
      });
      const offline = new OfflineAudioContext(2, Math.ceil(total * sr), sr);
      const master = offline.createGain();
      master.connect(offline.destination);
      const bGain = offline.createGain();
      bGain.gain.value = 0.85;
      bGain.connect(master);
      const bSrc = offline.createBufferSource();
      bSrc.buffer = backing;
      bSrc.connect(bGain);
      bSrc.start(0);
      recordings.forEach((r) => {
        const buf = buffersRef.current.get(r.id);
        if (!buf) return;
        const g = offline.createGain();
        g.gain.value = effectiveGain(r);
        g.connect(master);
        const s = offline.createBufferSource();
        s.buffer = buf;
        s.connect(g);
        s.start(Math.max(0, (r.startMs + r.offsetMs) / 1000 + nudge));
      });
      const rendered = await offline.startRendering();
      const url = URL.createObjectURL(audioBufferToWav(rendered));
      const a = document.createElement("a");
      a.href = url;
      a.download = "loka-samasta-prayer.wav";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch {
      setPrepError("Couldn't build the prayer. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  function tapBead(r: Recording) {
    setSoloIds((s) => (s.includes(r.id) ? s.filter((x) => x !== r.id) : [r.id]));
  }

  const soloName = soloIds.length === 1 ? recordings.find((r) => r.id === soloIds[0])?.name : null;

  /* UI */

  if (listState === "loading") {
    return <Card><p className="text-center" style={{ fontSize: "1.1rem", color: "var(--fg3)" }}>Gathering the voices</p></Card>;
  }
  if (listState === "error") {
    return <Card><p className="text-center" style={{ fontSize: "1.1rem", color: "var(--terra-700)" }}>We couldn&apos;t reach the prayer wheel. Please refresh.</p></Card>;
  }

  // Build 108 bead positions; the first `count` hold gathered voices.
  const beads = Array.from({ length: goal }, (_, i) => {
    const angle = (i / goal) * Math.PI * 2 - Math.PI / 2;
    const x = CX + R * Math.cos(angle);
    const y = CY + R * Math.sin(angle);
    const rec = recordings[i];
    return { i, x, y, rec };
  });

  return (
    <Card>
      <p className="text-center mb-5" style={{ fontSize: "1.15rem", lineHeight: 1.6, color: "var(--fg2)" }}>
        {recordings.length === 0
          ? "No voices yet, be the first to begin the prayer."
          : "Press play and let the wheel turn. Tap any bead to hear one voice."}
      </p>

      <div className="relative mx-auto" style={{ maxWidth: 380 }}>
        <svg viewBox="0 0 400 400" className="w-full h-auto" role="img" aria-label={`${count} of ${goal} voices gathered`}>
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="var(--surface-border)" strokeWidth="1" />
          <g className={playing ? "loka-wheel-spin" : undefined}>
            {beads.map(({ i, x, y, rec }) => {
              const filled = !!rec;
              const isSolo = rec && soloIds.includes(rec.id);
              const dimmed = rec && (soloIds.length > 0 ? !isSolo : !groupOn[rec.voiceType]);
              const color = rec?.voiceType === "HIGHER" ? "var(--gold-500)" : "var(--lapis-700)";
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={isSolo ? 9 : filled ? 6 : 3.5}
                  fill={filled ? color : "var(--parch-200)"}
                  stroke={isSolo ? "var(--gold-700)" : "none"}
                  strokeWidth={isSolo ? 2.5 : 0}
                  style={{
                    opacity: dimmed ? 0.3 : 1,
                    cursor: filled ? "pointer" : "default",
                    transition: "opacity 0.2s, r 0.15s",
                  }}
                  onClick={() => rec && tapBead(rec)}
                >
                  {rec && <title>{rec.name}</title>}
                </circle>
              );
            })}
          </g>
        </svg>

        {/* Center overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-10 pointer-events-none">
          <div className="pointer-events-auto flex flex-col items-center">
            <div className="font-serif" style={{ fontSize: "2.6rem", fontWeight: 500, color: "var(--ink-900)", lineHeight: 1 }}>
              {count}
            </div>
            <div style={{ fontSize: "0.95rem", color: "var(--fg3)", marginBottom: "0.75rem" }}>of {goal} voices</div>
            <button
              onClick={playing ? stop : play}
              disabled={preparing || recordings.length === 0}
              aria-label={playing ? "Stop" : "Play all voices"}
              className="rounded-full flex items-center justify-center transition-transform active:scale-95 disabled:opacity-40"
              style={{ width: 84, height: 84, background: "var(--gold-600)", color: "var(--fg-on-gold)", fontSize: "1.15rem", fontWeight: 600, boxShadow: "var(--shadow-md)" }}
            >
              {preparing ? "Wait" : playing ? "Stop" : "Play"}
            </button>
            <div style={{ fontSize: "0.95rem", color: "var(--fg2)", marginTop: "0.65rem", minHeight: "1.2em" }}>
              {soloName ? soloName : playing ? "All voices" : ""}
            </div>
          </div>
        </div>
      </div>

      {prepError && (
        <p className="text-center mt-4 px-4 py-2 rounded-xl" style={{ background: "var(--terra-100)", color: "var(--terra-700)" }}>
          {prepError}
        </p>
      )}

      {recordings.length > 0 && (
        <>
          {/* Section toggles */}
          <div className="flex justify-center gap-3 mt-7">
            <GroupButton
              on={groupOn.HIGHER}
              color="var(--gold-600)"
              label={`Higher (${higher.length})`}
              onClick={() => { setSoloIds([]); setGroupOn((g) => ({ ...g, HIGHER: !g.HIGHER })); }}
            />
            <GroupButton
              on={groupOn.LOWER}
              color="var(--lapis-700)"
              label={`Lower (${lower.length})`}
              onClick={() => { setSoloIds([]); setGroupOn((g) => ({ ...g, LOWER: !g.LOWER })); }}
            />
          </div>
          {soloIds.length > 0 && (
            <div className="text-center mt-3">
              <button onClick={() => setSoloIds([])} className="font-medium" style={{ fontSize: "1rem", color: "var(--gold-700)" }}>
                Hear everyone again
              </button>
            </div>
          )}

          {/* Quiet extras */}
          <div className="flex flex-col items-center gap-3 mt-7">
            <button
              onClick={downloadMix}
              disabled={downloading}
              className="font-medium disabled:opacity-50"
              style={{ fontSize: "0.95rem", color: "var(--fg3)" }}
            >
              {downloading ? "Preparing" : "Download the prayer"}
            </button>
            <details className="w-full max-w-xs">
              <summary className="text-center cursor-pointer" style={{ fontSize: "0.85rem", color: "var(--fg3)" }}>
                Adjust timing
              </summary>
              <div className="mt-2">
                <input
                  type="range"
                  min={-300}
                  max={300}
                  step={10}
                  value={nudgeMs}
                  onChange={(e) => setNudgeMs(Number(e.target.value))}
                  className="w-full accent-[#c4922b]"
                />
                <p className="text-center" style={{ fontSize: "0.8rem", color: "var(--fg3)" }}>
                  If voices feel early or late ({nudgeMs > 0 ? "+" : ""}{nudgeMs} ms). Press play to apply.
                </p>
              </div>
            </details>
          </div>
        </>
      )}

      <p className="font-serif italic text-center mt-7" style={{ fontSize: "1.05rem", color: "var(--fg2)" }}>
        {CHANT_TRANSLATION}
      </p>
    </Card>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-3xl p-6 sm:p-9"
      style={{ background: "#fff", border: "1px solid var(--surface-border)", boxShadow: "var(--shadow-md)" }}
    >
      {children}
    </div>
  );
}

function GroupButton({ on, color, label, onClick }: { on: boolean; color: string; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-5 py-2.5 rounded-full border font-semibold transition-colors"
      style={
        on
          ? { background: color, borderColor: color, color: "#fff", fontSize: "1.05rem" }
          : { background: "#fff", borderColor: "var(--surface-border)", color: "var(--fg3)", fontSize: "1.05rem" }
      }
    >
      {label}
    </button>
  );
}
