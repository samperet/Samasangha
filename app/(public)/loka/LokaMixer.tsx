"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import {
  audioBufferToWav,
  fetchAudioBuffer,
  formatTime,
  type Recording,
} from "./loka-shared";

export default function LokaMixer({ backingUrl, active }: { backingUrl: string; active: boolean }) {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [listState, setListState] = useState<"loading" | "ready" | "error">("loading");
  const [preparing, setPreparing] = useState(false);
  const [prepError, setPrepError] = useState("");
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [downloading, setDownloading] = useState(false);

  // Mix state
  const [trackOn, setTrackOn] = useState<Record<string, boolean>>({});
  const [trackVol, setTrackVol] = useState<Record<string, number>>({});
  const [soloIds, setSoloIds] = useState<string[]>([]);
  const [groupOn, setGroupOn] = useState<{ HIGHER: boolean; LOWER: boolean }>({ HIGHER: true, LOWER: true });
  const [backingOn, setBackingOn] = useState(true);
  const [backingVol, setBackingVol] = useState(0.85);
  const [masterVol, setMasterVol] = useState(1);
  const [nudgeMs, setNudgeMs] = useState(0);
  const [loop, setLoop] = useState(false);

  const ctxRef = useRef<AudioContext | null>(null);
  const backingBufRef = useRef<AudioBuffer | null>(null);
  const buffersRef = useRef<Map<string, AudioBuffer>>(new Map());
  const masterGainRef = useRef<GainNode | null>(null);
  const backingGainRef = useRef<GainNode | null>(null);
  const trackGainRef = useRef<Map<string, GainNode>>(new Map());
  const sourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const startRef = useRef(0);
  const rafRef = useRef(0);
  const loopRef = useRef(loop);
  loopRef.current = loop;

  // Load the approved list once.
  useEffect(() => {
    fetch("/api/loka/recordings")
      .then((r) => r.json())
      .then((data: Recording[]) => {
        setRecordings(data);
        setTrackOn(Object.fromEntries(data.map((r) => [r.id, true])));
        setTrackVol(Object.fromEntries(data.map((r) => [r.id, 1])));
        setListState("ready");
      })
      .catch(() => setListState("error"));
  }, []);

  const higher = recordings.filter((r) => r.voiceType === "HIGHER");
  const lower = recordings.filter((r) => r.voiceType === "LOWER");

  // Effective per-track gain given toggles / solo / volume.
  const effectiveGain = useCallback(
    (r: Recording) => {
      const anySolo = soloIds.length > 0;
      const on = trackOn[r.id] && groupOn[r.voiceType];
      const audible = anySolo ? soloIds.includes(r.id) : on;
      return audible ? (trackVol[r.id] ?? 1) : 0;
    },
    [soloIds, trackOn, groupOn, trackVol]
  );

  // Apply mix to live gain nodes whenever controls change during playback.
  useEffect(() => {
    if (!playing || !ctxRef.current) return;
    const t = ctxRef.current.currentTime;
    recordings.forEach((r) => {
      const g = trackGainRef.current.get(r.id);
      if (g) g.gain.setTargetAtTime(effectiveGain(r), t, 0.02);
    });
    if (backingGainRef.current) backingGainRef.current.gain.setTargetAtTime(backingOn ? backingVol : 0, t, 0.02);
    if (masterGainRef.current) masterGainRef.current.gain.setTargetAtTime(masterVol, t, 0.02);
  }, [playing, recordings, effectiveGain, backingOn, backingVol, masterVol]);

  const ensureCtx = useCallback(() => {
    if (!ctxRef.current) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctxRef.current = new AC();
    }
    return ctxRef.current;
  }, []);

  // Lazy-load + decode the backing track and every take.
  const prepare = useCallback(async () => {
    const ctx = ensureCtx();
    await ctx.resume();
    if (!backingBufRef.current) backingBufRef.current = await fetchAudioBuffer(ctx, backingUrl);
    for (const r of recordings) {
      if (!buffersRef.current.has(r.id)) {
        try {
          buffersRef.current.set(r.id, await fetchAudioBuffer(ctx, r.audioUrl));
        } catch {
          /* skip a take that won't decode */
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
    setProgress(0);
  }, []);

  const play = useCallback(async () => {
    setPrepError("");
    try {
      setPreparing(true);
      await prepare();
      setPreparing(false);
    } catch {
      setPreparing(false);
      setPrepError("The song isn't available yet. Please check back soon.");
      return;
    }
    const ctx = ctxRef.current!;
    const backing = backingBufRef.current!;
    const nudge = nudgeMs / 1000;

    const master = ctx.createGain();
    master.gain.value = masterVol;
    master.connect(ctx.destination);
    masterGainRef.current = master;

    const start = ctx.currentTime + 0.15;
    startRef.current = start;
    const sources: AudioBufferSourceNode[] = [];

    // Backing
    const bGain = ctx.createGain();
    bGain.gain.value = backingOn ? backingVol : 0;
    bGain.connect(master);
    backingGainRef.current = bGain;
    const bSrc = ctx.createBufferSource();
    bSrc.buffer = backing;
    bSrc.connect(bGain);
    bSrc.start(start);
    sources.push(bSrc);

    let totalDur = backing.duration;

    // Voices
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
      const desired = start + r.offsetMs / 1000 + nudge;
      if (desired >= ctx.currentTime) s.start(desired);
      else s.start(ctx.currentTime, ctx.currentTime - desired);
      sources.push(s);
      totalDur = Math.max(totalDur, r.offsetMs / 1000 + nudge + buf.duration);
    });

    sourcesRef.current = sources;
    setTotal(totalDur);
    setPlaying(true);

    const tick = () => {
      const elapsed = ctx.currentTime - startRef.current;
      setProgress(Math.min(elapsed, totalDur));
      if (elapsed >= totalDur) {
        if (loopRef.current) {
          stop();
          play();
          return;
        }
        stop();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [prepare, recordings, effectiveGain, backingOn, backingVol, masterVol, nudgeMs, stop]);

  // Stop audio when navigating away from the Listen tab, and on unmount.
  useEffect(() => {
    if (!active && playing) stop();
  }, [active, playing, stop]);
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  // Render the current mix to a downloadable WAV via OfflineAudioContext.
  async function downloadMix() {
    setDownloading(true);
    setPrepError("");
    try {
      await prepare();
      const backing = backingBufRef.current!;
      const nudge = nudgeMs / 1000;
      const sr = backing.sampleRate;
      let totalDur = backing.duration;
      recordings.forEach((r) => {
        const buf = buffersRef.current.get(r.id);
        if (buf) totalDur = Math.max(totalDur, r.offsetMs / 1000 + nudge + buf.duration);
      });
      const offline = new OfflineAudioContext(2, Math.ceil(totalDur * sr), sr);
      const master = offline.createGain();
      master.gain.value = masterVol;
      master.connect(offline.destination);

      const bGain = offline.createGain();
      bGain.gain.value = backingOn ? backingVol : 0;
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
        const at = Math.max(0, r.offsetMs / 1000 + nudge);
        s.start(at);
      });

      const rendered = await offline.startRendering();
      const url = URL.createObjectURL(audioBufferToWav(rendered));
      const a = document.createElement("a");
      a.href = url;
      a.download = "loka-samasta-sangha.wav";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch {
      setPrepError("Couldn't build the mix. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  function toggleSolo(id: string) {
    setSoloIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  /* ─────────────── UI ─────────────── */

  if (listState === "loading") {
    return <Card><p className="text-sm text-center" style={{ color: "var(--fg3)" }}>Loading voices…</p></Card>;
  }
  if (listState === "error") {
    return <Card><p className="text-sm text-center" style={{ color: "var(--terra-700)" }}>Couldn&apos;t load the voices. Please refresh.</p></Card>;
  }
  if (recordings.length === 0) {
    return (
      <Card>
        <div className="text-center py-6">
          <div className="text-3xl mb-3">✦</div>
          <h2 className="font-serif mb-2" style={{ fontSize: "1.4rem", fontWeight: 500, color: "var(--ink-900)" }}>
            No voices yet, be the first.
          </h2>
          <p className="text-sm" style={{ color: "var(--fg2)", maxWidth: "40ch", margin: "0 auto" }}>
            Once voices are added and approved, the whole sangha will sing here together.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      {/* Transport */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <Button onClick={playing ? stop : play} size="lg" disabled={preparing}>
          {preparing ? "Preparing…" : playing ? "■ Stop" : "▶ Play all together"}
        </Button>
        <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "var(--fg2)" }}>
          <input type="checkbox" checked={loop} onChange={(e) => setLoop(e.target.checked)} className="accent-[#c4922b]" />
          Loop
        </label>
        <span className="text-sm tabular-nums" style={{ color: "var(--fg3)" }}>
          {formatTime(progress)} / {formatTime(total || 0)}
        </span>
        <button
          onClick={downloadMix}
          disabled={downloading}
          className="ml-auto text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50"
          style={{ borderColor: "var(--surface-border)", color: "var(--ink-700)", background: "var(--parch-100)" }}
        >
          {downloading ? "Building…" : "↓ Download mix"}
        </button>
      </div>

      {/* Progress */}
      <div className="h-1.5 rounded-full overflow-hidden mb-6" style={{ background: "var(--parch-200)" }}>
        <div className="h-full" style={{ width: total ? `${(progress / total) * 100}%` : "0%", background: "var(--gold-500)" }} />
      </div>

      {prepError && (
        <p className="text-sm px-3 py-2 rounded-lg mb-4" style={{ background: "var(--terra-100)", color: "var(--terra-700)" }}>
          {prepError}
        </p>
      )}

      <p className="text-xs mb-5" style={{ color: "var(--fg3)" }}>
        {recordings.length} voice{recordings.length === 1 ? "" : "s"} · {higher.length} higher · {lower.length} lower.
        Toggle voices or whole sections, solo a voice, and use the sync slider if a take feels early or late.
      </p>

      {/* Backing + master + sync */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6 p-4 rounded-xl" style={{ background: "var(--parch-100)" }}>
        <Slider
          label="Song"
          on={backingOn}
          onToggle={() => setBackingOn((v) => !v)}
          value={backingVol}
          onChange={setBackingVol}
        />
        <Slider label="Overall volume" value={masterVol} onChange={setMasterVol} />
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: "var(--ink-700)" }}>
            Sync nudge ({nudgeMs > 0 ? "+" : ""}{nudgeMs} ms)
          </label>
          <input
            type="range"
            min={-300}
            max={300}
            step={10}
            value={nudgeMs}
            onChange={(e) => setNudgeMs(Number(e.target.value))}
            className="w-full accent-[#c4922b]"
          />
          <p className="text-[11px]" style={{ color: "var(--fg3)" }}>Applies on next play</p>
        </div>
      </div>

      {/* Voice groups */}
      {[
        { key: "HIGHER" as const, label: "Higher voices", list: higher },
        { key: "LOWER" as const, label: "Lower voices", list: lower },
      ].map(
        ({ key, label, list }) =>
          list.length > 0 && (
            <div key={key} className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 500, color: "var(--ink-900)" }}>
                  {label} <span className="text-sm" style={{ color: "var(--fg3)" }}>({list.length})</span>
                </h3>
                <button
                  onClick={() => setGroupOn((g) => ({ ...g, [key]: !g[key] }))}
                  className="text-xs font-medium px-3 py-1 rounded-full border transition-colors"
                  style={
                    groupOn[key]
                      ? { background: "var(--gold-100)", borderColor: "var(--gold-500)", color: "var(--gold-700)" }
                      : { background: "#fff", borderColor: "var(--surface-border)", color: "var(--fg3)" }
                  }
                >
                  {groupOn[key] ? "All on" : "All off"}
                </button>
              </div>
              <div className="space-y-1.5">
                {list.map((r) => {
                  const isOn = trackOn[r.id] && groupOn[r.voiceType];
                  const isSolo = soloIds.includes(r.id);
                  return (
                    <div
                      key={r.id}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg"
                      style={{ background: "#fff", border: "1px solid var(--surface-border)", opacity: groupOn[key] ? 1 : 0.5 }}
                    >
                      <button
                        onClick={() => setTrackOn((t) => ({ ...t, [r.id]: !t[r.id] }))}
                        aria-label={isOn ? "Mute" : "Unmute"}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0"
                        style={
                          isOn
                            ? { background: "var(--gold-600)", color: "var(--fg-on-gold)" }
                            : { background: "var(--parch-200)", color: "var(--fg3)" }
                        }
                      >
                        {isOn ? "♪" : "—"}
                      </button>
                      <span className="text-sm flex-1 min-w-0 truncate" style={{ color: "var(--ink-800)" }}>{r.name}</span>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={trackVol[r.id] ?? 1}
                        onChange={(e) => setTrackVol((v) => ({ ...v, [r.id]: Number(e.target.value) }))}
                        className="w-24 accent-[#c4922b]"
                        aria-label={`${r.name} volume`}
                      />
                      <button
                        onClick={() => toggleSolo(r.id)}
                        className="text-xs font-semibold w-7 h-7 rounded-full shrink-0 transition-colors"
                        style={
                          isSolo
                            ? { background: "var(--lapis-700)", color: "var(--fg-on-dark)" }
                            : { background: "var(--parch-100)", color: "var(--fg3)" }
                        }
                        aria-label="Solo"
                        title="Solo"
                      >
                        S
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )
      )}
    </Card>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-6 sm:p-8"
      style={{ background: "#fff", border: "1px solid var(--surface-border)", boxShadow: "var(--shadow-sm)" }}
    >
      {children}
    </div>
  );
}

function Slider({
  label,
  value,
  onChange,
  on,
  onToggle,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  on?: boolean;
  onToggle?: () => void;
}) {
  return (
    <div>
      <label className="flex items-center justify-between text-xs font-semibold mb-1" style={{ color: "var(--ink-700)" }}>
        <span>{label}</span>
        {onToggle && (
          <button onClick={onToggle} className="text-[11px]" style={{ color: on ? "var(--gold-700)" : "var(--fg3)" }}>
            {on ? "on" : "off"}
          </button>
        )}
      </label>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#c4922b]"
      />
    </div>
  );
}
