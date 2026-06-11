"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

// Single-string text so CSS handles wrapping naturally — no artificial line breaks
const SLIDES = [
  {
    lang: "English",
    text: "Towards the One, the Perfection of Love, Harmony and Beauty, the Only Being, united with all the Illuminated Souls who form the Embodiment of the Master, the Spirit of Guidance.",
  },
  {
    lang: "Spanish",
    text: "Hacia el Uno, la Perfección del Amor, la Armonía y la Belleza, el Único Ser, unido con todas las Almas Iluminadas que forman la encarnación del Maestro, el Espíritu de la Guía.",
  },
  {
    lang: "Turkish",
    text: "Tek Olana Doğru, Sevginin, Uyumun ve Güzelliğin Mükemmelliği, Tek Varlık, tüm Aydınlanmış Ruhlarla birleşmiş, Ustanın bedenini oluşturan Rehberlik Ruhu.",
  },
  {
    lang: "Italian",
    text: "Verso l'Uno, la Perfezione dell'Amore, dell'Armonia e della Bellezza, l'Unico Essere, unito con tutte le Anime Illuminate che formano l'incarnazione del Maestro, lo Spirito della Guida.",
  },
  {
    lang: "Russian",
    text: "К Единому, Совершенству Любви, Гармонии и Красоты, Единственному Существу, объединённому со всеми Просветлёнными Душами, воплощающими Учителя, Духу Руководства.",
  },
  {
    lang: "Japanese",
    text: "ひとつなるものへ、愛と調和と美の完成、唯一の存在、師の体現をなす全ての光明の魂と共に、導きの霊。",
  },
  {
    lang: "Hindi",
    text: "एक की ओर, प्रेम, सामंजस्य और सौंदर्य की पूर्णता, एकमात्र सत्ता, उन सभी प्रकाशित आत्माओं के साथ एकजुट जो गुरु के अवतार का निर्माण करती हैं, मार्गदर्शन की आत्मा।",
  },
  {
    lang: "Arabic",
    text: "نحو الواحد، كمال الحب والانسجام والجمال، الكيان الوحيد، متحداً مع جميع الأرواح المنيرة التي تشكل تجسيد المرشد، روح الهداية.",
  },
];

const FADE_MS    = 2000;
const CLICK_FADE = 500;

function Caret({ dir, onClick }: { dir: "prev" | "next"; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={dir === "prev" ? "Previous language" : "Next language"}
      className="hidden sm:inline-block"
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "8px 56px",
        color: "var(--gold-600)",
        fontSize: "4rem",
        lineHeight: 1,
        fontFamily: "var(--font-serif)",
        opacity: 0.7,
        flexShrink: 0,
        transition: "opacity 0.2s ease",
        userSelect: "none",
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.7")}
    >
      {dir === "prev" ? "‹" : "›"}
    </button>
  );
}

export default function InvocationCarousel() {
  const [idx, setIdx]         = useState(0);
  const [visible, setVisible] = useState(true);
  const [fadeMs, setFadeMs]   = useState(FADE_MS);

  const [heartClicks, setHeartClicks] = useState(0);
  const [showGate, setShowGate]       = useState(false);
  const [password, setPassword]       = useState("");
  const [shake, setShake]             = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router   = useRouter();

  function handleHeartClick() {
    const next = heartClicks + 1;
    setHeartClicks(next);
    if (next >= 3) {
      setShowGate(true);
      setHeartClicks(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setPassword(val);
    if (val === "108isGreat") {
      router.push("/admin");
    }
  }

  function handlePasswordKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setShowGate(false);
      setPassword("");
    } else if (e.key === "Enter" && password !== "108isGreat") {
      setShake(true);
      setPassword("");
      setTimeout(() => setShake(false), 500);
    }
  }

  const go = useCallback((next: number, duration = FADE_MS) => {
    setFadeMs(duration);
    setVisible(false);
    setTimeout(() => {
      setIdx((next + SLIDES.length) % SLIDES.length);
      setVisible(true);
    }, duration);
  }, []);

  const prev = () => go(idx - 1, CLICK_FADE);
  const next = () => go(idx + 1, CLICK_FADE);

  const slide = SLIDES[idx];

  return (
    <div
      className="flex flex-col items-center text-center"
      style={{ width: "100%", paddingTop: "clamp(12px, 4vh, 56px)", paddingBottom: "clamp(12px, 4vh, 56px)", gap: 0 }}
    >
      {/* Heading kept for SEO/structure, visually hidden — also the quiet
          trigger for the inner door (3 clicks). The wordmark image was removed. */}
      <h1
        onClick={handleHeartClick}
        className="select-none"
        style={{ margin: 0, width: 96, height: 14, fontSize: 0, color: "transparent", cursor: "default" }}
      >
        SamaSangha
      </h1>

      {/* Secret gate */}
      {showGate && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 999,
            background: "rgba(18,12,4,0.82)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) { setShowGate(false); setPassword(""); } }}
        >
          <div
            style={{
              background: "var(--parch-50)",
              border: "1px solid var(--surface-border)",
              borderRadius: 20,
              padding: "2.5rem 2.5rem 2rem",
              width: "min(420px, 90vw)",
              textAlign: "center",
              boxShadow: "0 24px 64px rgba(0,0,0,0.45)",
            }}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>☽ ✦ ☾</div>
            <p
              className="font-serif"
              style={{ fontSize: "1.25rem", fontWeight: 500, color: "var(--ink-900)", marginBottom: "0.4rem" }}
            >
              The inner door
            </p>
            <p style={{ fontSize: "0.85rem", color: "var(--fg2)", marginBottom: "1.5rem" }}>
              Speak the word of passage
            </p>
            <input
              ref={inputRef}
              type="password"
              value={password}
              onChange={handlePasswordChange}
              onKeyDown={handlePasswordKeyDown}
              placeholder="&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;"
              style={{
                width: "100%",
                padding: "0.7rem 1rem",
                borderRadius: 10,
                border: `1.5px solid ${shake ? "var(--crimson-700)" : "var(--surface-border)"}`,
                background: "var(--parch-100)",
                fontFamily: "var(--font-serif)",
                fontSize: "1.1rem",
                textAlign: "center",
                letterSpacing: "0.2em",
                color: "var(--ink-900)",
                outline: "none",
                transition: "border-color 0.2s, transform 0.1s",
                transform: shake ? "translateX(6px)" : "none",
              }}
            />
            <p style={{ fontSize: "0.72rem", color: "var(--fg3)", marginTop: "1rem" }}>
              Press Esc to close
            </p>
          </div>
        </div>
      )}

      {/* Carousel row: caret · text · caret */}
      <div className="flex items-center" style={{ width: "100%", gap: 0 }}>
        <Caret dir="prev" onClick={prev} />

        {/* Fixed-height text area so carets never shift */}
        <div
          style={{
            flex: 1,
            minHeight: "clamp(220px, 42vh, 380px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
          }}
        >
          {slide.lang !== "English" && (
            <p
              className="eyebrow"
              style={{
                fontSize: "0.85rem",
                color: "var(--gold-600)",
                margin: 0,
                opacity: visible ? 1 : 0,
                transition: `opacity ${fadeMs}ms ease`,
              }}
            >
              {`Invocation in ${slide.lang}`}
            </p>
          )}

          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: "clamp(1.5rem, 3.2vw, 2.4rem)",
              lineHeight: 1.55,
              maxWidth: "100%",
              color: "var(--ink-800)",
              margin: 0,
              opacity: visible ? 1 : 0,
              transition: `opacity ${fadeMs}ms ease`,
            }}
          >
            {slide.text}
          </p>
        </div>

        <Caret dir="next" onClick={next} />
      </div>
    </div>
  );
}
