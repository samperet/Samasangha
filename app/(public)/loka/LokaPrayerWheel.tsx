"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  audioBufferToWav,
  CHANT_TRANSLATION,
  fetchAudioBuffer,
  formatTime,
  type Recording,
} from "./loka-shared";

const WAVE_BARS = 240;

// Downsample one channel of an AudioBuffer into normalized 0..1 peaks.
function computePeaks(buffer: AudioBuffer, bars: number): number[] {
  const data = buffer.getChannelData(0);
  const block = Math.max(1, Math.floor(data.length / bars));
  const peaks = new Array<number>(bars).fill(0);
  let max = 0;
  for (let i = 0; i < bars; i++) {
    let m = 0;
    const start = i * block;
    for (let j = 0; j < block; j++) {
      const v = Math.abs(data[start + j] || 0);
      if (v > m) m = v;
    }
    peaks[i] = m;
    if (m > max) max = m;
  }
  if (max > 0) for (let i = 0; i < bars; i++) peaks[i] /= max;
  return peaks;
}

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
  const [prepared, setPrepared] = useState(false);
  const [prepError, setPrepError] = useState("");
  const [playing, setPlaying] = useState(false);
  const [disabled, setDisabled] = useState<Set<string>>(new Set());
  const [nudgeMs, setNudgeMs] = useState(0);
  // Per-voice mix: volume (0–1.5, default 1) and timing nudge in ms (default 0).
  const [volumes, setVolumes] = useState<Record<string, number>>({});
  const [voiceNudge, setVoiceNudge] = useState<Record<string, number>>({});
  const [downloading, setDownloading] = useState(false);
  const [peaks, setPeaks] = useState<number[]>([]);
  const [duration, setDuration] = useState(0);
  const [displayPos, setDisplayPos] = useState(0);

  const ctxRef = useRef<AudioContext | null>(null);
  const backingBufRef = useRef<AudioBuffer | null>(null);
  const buffersRef = useRef<Map<string, AudioBuffer>>(new Map());
  const masterRef = useRef<GainNode | null>(null);
  const trackGainRef = useRef<Map<string, GainNode>>(new Map());
  const sourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const playStartCtxRef = useRef(0); // ctx.currentTime when playback (re)started
  const playHeadBaseRef = useRef(0); // playhead position (s) at that ctx time
  const totalRef = useRef(0);
  const positionRef = useRef(0);
  const rafRef = useRef(0);
  const seekingRef = useRef(false);
  const prepRef = useRef(false);
  const lastDispRef = useRef(0);

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
    (r: Recording) => (disabled.has(r.id) ? 0 : volumes[r.id] ?? 1),
    [disabled, volumes]
  );

  // Per-voice timing nudge (ms) on top of the global nudge, in seconds.
  const voiceNudgeSec = useCallback((r: Recording) => (voiceNudge[r.id] ?? 0) / 1000, [voiceNudge]);

  // Live-apply voice toggles while playing.
  useEffect(() => {
    if (!playing || !ctxRef.current) return;
    const t = ctxRef.current.currentTime;
    recordings.forEach((r) => {
      const g = trackGainRef.current.get(r.id);
      if (g) g.gain.setTargetAtTime(effectiveGain(r), t, 0.04);
    });
  }, [playing, recordings, effectiveGain]);

  const ensureCtx = useCallback(() => {
    if (!ctxRef.current) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctxRef.current = new AC();
    }
    return ctxRef.current;
  }, []);

  // Fetch + decode the backing track and every recording (cached by id).
  const prepare = useCallback(async () => {
    const ctx = ensureCtx();
    if (!backingBufRef.current) backingBufRef.current = await fetchAudioBuffer(ctx, backingUrl);
    for (const r of recordings) {
      if (!buffersRef.current.has(r.id)) {
        try {
          buffersRef.current.set(r.id, await fetchAudioBuffer(ctx, r.audioUrl));
        } catch {
          /* skip a take that won't load */
        }
      }
    }
  }, [ensureCtx, recordings, backingUrl]);

  const recomputeDuration = useCallback(() => {
    const backing = backingBufRef.current;
    if (!backing) return;
    const nudge = nudgeMs / 1000;
    let total = backing.duration;
    recordings.forEach((r) => {
      const buf = buffersRef.current.get(r.id);
      if (buf)
        total = Math.max(total, (r.startMs + r.offsetMs) / 1000 + nudge + voiceNudgeSec(r) + buf.duration);
    });
    totalRef.current = total;
    setDuration(total);
  }, [nudgeMs, recordings, voiceNudgeSec]);

  // Decode everything when the tab opens (or new voices arrive) so we can draw
  // the waveform and scrub.
  useEffect(() => {
    if (!active || listState !== "ready" || recordings.length === 0) return;
    let cancelled = false;
    (async () => {
      if (prepRef.current) return;
      prepRef.current = true;
      try {
        setPreparing(true);
        await prepare();
        if (cancelled) return;
        const backing = backingBufRef.current;
        if (backing) setPeaks(computePeaks(backing, WAVE_BARS));
        recomputeDuration();
        setPrepared(true);
      } catch {
        if (!cancelled)
          setPrepError("The prayer isn't ready just yet. Please try again in a little while.");
      } finally {
        setPreparing(false);
        prepRef.current = false;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [active, listState, recordings, prepare, recomputeDuration]);

  useEffect(() => {
    if (prepared) recomputeDuration();
  }, [nudgeMs, prepared, recomputeDuration]);

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

  const playFrom = useCallback(
    async (fromSec: number) => {
      setPrepError("");
      const ctx = ensureCtx();
      await ctx.resume();
      if (!prepared) {
        try {
          setPreparing(true);
          await prepare();
          const backing = backingBufRef.current;
          if (backing) setPeaks(computePeaks(backing, WAVE_BARS));
          recomputeDuration();
          setPrepared(true);
        } catch {
          setPreparing(false);
          setPrepError("The prayer isn't ready just yet. Please try again in a little while.");
          return;
        } finally {
          setPreparing(false);
        }
      }
      const backing = backingBufRef.current;
      if (!backing) return;
      const nudge = nudgeMs / 1000;

      const master = ctx.createGain();
      master.gain.value = 1;
      master.connect(ctx.destination);
      masterRef.current = master;

      const ctxStart = ctx.currentTime + 0.12;
      playStartCtxRef.current = ctxStart;
      playHeadBaseRef.current = fromSec;
      const sources: AudioBufferSourceNode[] = [];

      // Schedule one buffer whose timeline position is `ts`, so the playhead
      // lands at `fromSec` when ctxStart is reached.
      const schedule = (buf: AudioBuffer, ts: number, gainVal: number): GainNode | null => {
        const rel = ts - fromSec;
        const into = -rel;
        if (rel < 0 && into >= buf.duration) return null; // already finished
        const g = ctx.createGain();
        g.gain.value = gainVal;
        g.connect(master);
        const s = ctx.createBufferSource();
        s.buffer = buf;
        s.connect(g);
        if (rel >= 0) s.start(ctxStart + rel);
        else s.start(ctxStart, into);
        sources.push(s);
        return g;
      };

      trackGainRef.current.clear();
      schedule(backing, 0, 0.85); // backing chant is always on
      recordings.forEach((r) => {
        const buf = buffersRef.current.get(r.id);
        if (!buf) return;
        const ts = (r.startMs + r.offsetMs) / 1000 + nudge + voiceNudgeSec(r);
        const g = schedule(buf, ts, effectiveGain(r));
        if (g) trackGainRef.current.set(r.id, g);
      });

      sourcesRef.current = sources;
      setPlaying(true);

      const tick = () => {
        const p = ctx.currentTime - playStartCtxRef.current + playHeadBaseRef.current;
        if (p >= totalRef.current) {
          stop();
          positionRef.current = 0;
          setDisplayPos(0);
          return;
        }
        if (!seekingRef.current) {
          positionRef.current = p;
          const now = performance.now();
          if (now - lastDispRef.current > 120) {
            lastDispRef.current = now;
            setDisplayPos(p);
          }
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    },
    [ensureCtx, prepared, prepare, recomputeDuration, nudgeMs, recordings, effectiveGain, voiceNudgeSec, stop]
  );

  const onPlayPause = useCallback(() => {
    if (playing) stop();
    else {
      const from = positionRef.current >= totalRef.current ? 0 : positionRef.current;
      void playFrom(from);
    }
  }, [playing, stop, playFrom]);

  const seekPreview = useCallback((sec: number) => {
    seekingRef.current = true;
    positionRef.current = sec;
    setDisplayPos(sec);
  }, []);

  const seekCommit = useCallback(
    (sec: number) => {
      positionRef.current = sec;
      setDisplayPos(sec);
      seekingRef.current = false;
      if (playing) {
        stop();
        void playFrom(sec);
      }
    },
    [playing, stop, playFrom]
  );

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
        if (buf)
          total = Math.max(total, (r.startMs + r.offsetMs) / 1000 + nudge + voiceNudgeSec(r) + buf.duration);
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
        s.start(Math.max(0, (r.startMs + r.offsetMs) / 1000 + nudge + voiceNudgeSec(r)));
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

  function toggleVoice(id: string) {
    setDisabled((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleGroup(type: "HIGHER" | "LOWER") {
    setDisabled((prev) => {
      const ids = recordings.filter((r) => r.voiceType === type).map((r) => r.id);
      const allOn = ids.every((id) => !prev.has(id));
      const next = new Set(prev);
      if (allOn) ids.forEach((id) => next.add(id));
      else ids.forEach((id) => next.delete(id));
      return next;
    });
  }

  function setVolume(id: string, v: number) {
    setVolumes((prev) => ({ ...prev, [id]: v }));
  }

  function setNudge(id: string, ms: number) {
    setVoiceNudge((prev) => ({ ...prev, [id]: ms }));
  }

  /* UI */

  if (listState === "loading") {
    return (
      <Card>
        <p className="text-center" style={{ fontSize: "1.1rem", color: "var(--fg3)" }}>
          Gathering the voices
        </p>
      </Card>
    );
  }
  if (listState === "error") {
    return (
      <Card>
        <p className="text-center" style={{ fontSize: "1.1rem", color: "var(--terra-700)" }}>
          We couldn&apos;t reach the prayer wheel. Please refresh.
        </p>
      </Card>
    );
  }

  const groupAllOn = (list: Recording[]) => list.length > 0 && list.every((r) => !disabled.has(r.id));
  const groupAnyOn = (list: Recording[]) => list.some((r) => !disabled.has(r.id));

  return (
    <Card>
      <p className="text-center mb-1" style={{ fontSize: "1.15rem", lineHeight: 1.6, color: "var(--fg2)" }}>
        {recordings.length === 0
          ? "No voices yet, be the first to begin the prayer."
          : "Press play and let the prayer sing. Scrub the wave, or mix each voice below."}
      </p>

      {recordings.length > 0 && (
        <p className="text-center mb-6" style={{ fontSize: "0.95rem", color: "var(--fg3)" }}>
          <strong style={{ color: "var(--ink-900)" }}>{count}</strong> of {goal} voices gathered
        </p>
      )}

      {recordings.length > 0 && (
        <>
          {/* Player */}
          <div
            className="rounded-2xl p-4 sm:p-5"
            style={{ background: "var(--parch-100)", border: "1px solid var(--surface-border)" }}
          >
            <WaveScrubber
              peaks={peaks}
              duration={duration}
              positionRef={positionRef}
              active={active}
              ready={prepared}
              onSeekPreview={seekPreview}
              onSeekCommit={seekCommit}
            />

            <div className="flex items-center gap-4 mt-4">
              <button
                onClick={onPlayPause}
                disabled={preparing}
                aria-label={playing ? "Pause" : "Play the prayer"}
                className="rounded-full flex items-center justify-center transition-transform active:scale-95 disabled:opacity-40 shrink-0"
                style={{
                  width: 60,
                  height: 60,
                  background: "var(--gold-600)",
                  color: "var(--fg-on-gold)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                {preparing ? (
                  <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>Wait</span>
                ) : playing ? (
                  <PauseIcon />
                ) : (
                  <PlayIcon />
                )}
              </button>
              <div
                className="font-mono tabular-nums"
                style={{ fontSize: "1rem", color: "var(--fg2)", minWidth: "5.5ch" }}
              >
                {formatTime(displayPos)} <span style={{ color: "var(--fg3)" }}>/ {formatTime(duration)}</span>
              </div>
            </div>
          </div>

          {prepError && (
            <p
              className="text-center mt-4 px-4 py-2 rounded-xl"
              style={{ background: "var(--terra-100)", color: "var(--terra-700)" }}
            >
              {prepError}
            </p>
          )}

          {/* Group toggles */}
          <div className="flex justify-center gap-3 mt-7">
            <GroupButton
              allOn={groupAllOn(higher)}
              anyOn={groupAnyOn(higher)}
              color="var(--gold-600)"
              label={`Higher (${higher.length})`}
              disabled={higher.length === 0}
              onClick={() => toggleGroup("HIGHER")}
            />
            <GroupButton
              allOn={groupAllOn(lower)}
              anyOn={groupAnyOn(lower)}
              color="var(--lapis-700)"
              label={`Lower (${lower.length})`}
              disabled={lower.length === 0}
              onClick={() => toggleGroup("LOWER")}
            />
          </div>

          {/* Per-voice mixer */}
          <div className="mt-5 space-y-6">
            {higher.length > 0 && (
              <div>
                <p className="mb-2 font-semibold" style={{ fontSize: "0.9rem", color: "var(--gold-700)" }}>
                  Higher voices
                </p>
                <VoiceMixer
                  list={higher}
                  color="var(--gold-600)"
                  disabledSet={disabled}
                  volumes={volumes}
                  nudges={voiceNudge}
                  onToggle={toggleVoice}
                  onVolume={setVolume}
                  onNudge={setNudge}
                />
              </div>
            )}
            {lower.length > 0 && (
              <div>
                <p className="mb-2 font-semibold" style={{ fontSize: "0.9rem", color: "var(--lapis-700)" }}>
                  Lower voices
                </p>
                <VoiceMixer
                  list={lower}
                  color="var(--lapis-700)"
                  disabledSet={disabled}
                  volumes={volumes}
                  nudges={voiceNudge}
                  onToggle={toggleVoice}
                  onVolume={setVolume}
                  onNudge={setNudge}
                />
              </div>
            )}
            <p className="text-center" style={{ fontSize: "0.8rem", color: "var(--fg3)" }}>
              Volume changes apply as you listen. Press play to apply timing changes.
            </p>
          </div>

          {/* Quiet extras */}
          <div className="flex flex-col items-center gap-3 mt-8">
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
                Nudge all voices together
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
                  If voices feel early or late ({nudgeMs > 0 ? "+" : ""}
                  {nudgeMs} ms). Press play to apply.
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

/* ── Waveform scrubber ─────────────────────────────────────────────── */

function cssVar(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function WaveScrubber({
  peaks,
  duration,
  positionRef,
  active,
  ready,
  onSeekPreview,
  onSeekCommit,
}: {
  peaks: number[];
  duration: number;
  positionRef: React.MutableRefObject<number>;
  active: boolean;
  ready: boolean;
  onSeekPreview: (sec: number) => void;
  onSeekCommit: (sec: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const draggingRef = useRef(false);

  const draw = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    const w = c.clientWidth;
    const h = c.clientHeight;
    if (w === 0 || h === 0) return;
    if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
    }
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const played = cssVar("--gold-600", "#c4922b");
    const rest = cssVar("--parch-300", "#e4d7bd");
    const headColor = cssVar("--gold-700", "#a9791f");

    const n = peaks.length || WAVE_BARS;
    const prog = duration > 0 ? positionRef.current / duration : 0;
    const barW = w / n;
    const mid = h / 2;

    for (let i = 0; i < n; i++) {
      const p = peaks[i] ?? 0;
      const bh = Math.max(2, p * (h - 6));
      const x = i * barW;
      ctx.fillStyle = i / n <= prog ? played : rest;
      ctx.fillRect(x + barW * 0.15, mid - bh / 2, Math.max(1, barW * 0.7), bh);
    }
    // playhead
    if (duration > 0) {
      ctx.fillStyle = headColor;
      ctx.fillRect(Math.min(w - 2, Math.max(0, prog * w)), 0, 2, h);
    }
  }, [peaks, duration, positionRef]);

  // Continuous redraw while the tab is open (cheap; one canvas).
  useEffect(() => {
    if (!active) {
      draw();
      return;
    }
    let raf = 0;
    const loop = () => {
      draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, draw]);

  useEffect(() => {
    const onResize = () => draw();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [draw]);

  const posFromEvent = (clientX: number): number => {
    const c = canvasRef.current;
    if (!c || duration <= 0) return 0;
    const r = c.getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    return frac * duration;
  };

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={(e) => {
        if (!ready) return;
        draggingRef.current = true;
        (e.target as Element).setPointerCapture(e.pointerId);
        onSeekPreview(posFromEvent(e.clientX));
      }}
      onPointerMove={(e) => {
        if (draggingRef.current) onSeekPreview(posFromEvent(e.clientX));
      }}
      onPointerUp={(e) => {
        if (!draggingRef.current) return;
        draggingRef.current = false;
        onSeekCommit(posFromEvent(e.clientX));
      }}
      style={{
        width: "100%",
        height: 88,
        display: "block",
        cursor: ready ? "pointer" : "default",
        touchAction: "none",
      }}
      aria-label="Prayer waveform, tap or drag to scrub"
    />
  );
}

/* ── Pieces ────────────────────────────────────────────────────────── */

function VoiceMixer({
  list,
  color,
  disabledSet,
  volumes,
  nudges,
  onToggle,
  onVolume,
  onNudge,
}: {
  list: Recording[];
  color: string;
  disabledSet: Set<string>;
  volumes: Record<string, number>;
  nudges: Record<string, number>;
  onToggle: (id: string) => void;
  onVolume: (id: string, v: number) => void;
  onNudge: (id: string, ms: number) => void;
}) {
  if (list.length === 0) return null;
  return (
    <div className="space-y-2.5">
      {list.map((r) => {
        const on = !disabledSet.has(r.id);
        const vol = volumes[r.id] ?? 1;
        const nudge = nudges[r.id] ?? 0;
        return (
          <div
            key={r.id}
            className="rounded-xl px-3 py-2.5"
            style={{
              border: "1px solid var(--surface-border)",
              background: on ? "#fff" : "var(--parch-100)",
            }}
          >
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => onToggle(r.id)}
                aria-pressed={on}
                title={on ? `Mute ${r.name}` : `Unmute ${r.name}`}
                className="shrink-0 rounded-full transition-colors"
                style={{
                  width: 18,
                  height: 18,
                  background: on ? color : "transparent",
                  border: `2px solid ${on ? color : "var(--fg3)"}`,
                }}
              />
              <span
                className="flex-1 font-medium truncate"
                style={{ fontSize: "0.95rem", color: on ? "var(--ink-800)" : "var(--fg3)" }}
              >
                {r.name}
              </span>
              <span className="tabular-nums" style={{ fontSize: "0.8rem", color: "var(--fg3)" }}>
                {Math.round(vol * 100)}%
              </span>
            </div>

            <label className="flex items-center gap-2 mt-2" style={{ fontSize: "0.78rem", color: "var(--fg3)" }}>
              <span style={{ width: "3.5em" }}>Volume</span>
              <input
                type="range"
                min={0}
                max={1.5}
                step={0.05}
                value={vol}
                disabled={!on}
                onChange={(e) => onVolume(r.id, Number(e.target.value))}
                className="flex-1 disabled:opacity-40"
                style={{ accentColor: color }}
                aria-label={`Volume for ${r.name}`}
              />
            </label>

            <label className="flex items-center gap-2 mt-1.5" style={{ fontSize: "0.78rem", color: "var(--fg3)" }}>
              <span style={{ width: "3.5em" }}>Timing</span>
              <input
                type="range"
                min={-500}
                max={500}
                step={10}
                value={nudge}
                onChange={(e) => onNudge(r.id, Number(e.target.value))}
                className="flex-1"
                style={{ accentColor: color }}
                aria-label={`Timing for ${r.name}`}
              />
              <span className="tabular-nums" style={{ width: "4.8em", textAlign: "right" }}>
                {nudge > 0 ? "+" : ""}
                {nudge} ms
              </span>
            </label>
          </div>
        );
      })}
    </div>
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

function GroupButton({
  allOn,
  anyOn,
  color,
  label,
  disabled,
  onClick,
}: {
  allOn: boolean;
  anyOn: boolean;
  color: string;
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-5 py-2.5 rounded-full border font-semibold transition-colors disabled:opacity-40"
      style={
        allOn
          ? { background: color, borderColor: color, color: "#fff", fontSize: "1.05rem" }
          : anyOn
            ? { background: "#fff", borderColor: color, color, fontSize: "1.05rem" }
            : { background: "#fff", borderColor: "var(--surface-border)", color: "var(--fg3)", fontSize: "1.05rem" }
      }
      title={allOn ? `Mute all ${label}` : `Unmute all ${label}`}
    >
      {label}
    </button>
  );
}

function PlayIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5.14v13.72a.5.5 0 0 0 .77.42l10.29-6.86a.5.5 0 0 0 0-.84L8.77 4.72A.5.5 0 0 0 8 5.14z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  );
}
