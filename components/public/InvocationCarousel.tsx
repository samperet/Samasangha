"use client";

import { useRef } from "react";

// Single-string text so CSS handles wrapping naturally, no artificial line breaks
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

const TEXT_BLUE = "#1b7187";

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
        padding: "8px 48px",
        color: TEXT_BLUE,
        fontSize: "6rem",
        fontWeight: 700,
        lineHeight: 1,
        fontFamily: "var(--font-serif)",
        textShadow: "0 2px 6px rgba(42,33,24,0.35)",
        opacity: 0.85,
        flexShrink: 0,
        transition: "opacity 0.2s ease",
        userSelect: "none",
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.85")}
    >
      {dir === "prev" ? "‹" : "›"}
    </button>
  );
}

export default function InvocationCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollBySlide = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div
      className="flex flex-col items-center text-center"
      style={{ width: "100%", paddingTop: "clamp(12px, 4vh, 56px)", paddingBottom: "clamp(12px, 4vh, 56px)", gap: 0 }}
    >
      {/* Heading kept for SEO/structure, visually hidden. */}
      <h1
        className="select-none"
        style={{ margin: 0, width: 96, height: 14, fontSize: 0, color: "transparent" }}
      >
        SamaSangha
      </h1>

      {/* Carousel row: caret · scroll track · caret */}
      <div className="flex items-center" style={{ width: "100%", gap: 0 }}>
        <Caret dir="prev" onClick={() => scrollBySlide(-1)} />

        {/* Horizontal scroll-snap track. Carets scroll it; on mobile the
            visitor swipes with a finger. */}
        <div
          ref={scrollerRef}
          className="no-scrollbar"
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
            overscrollBehaviorX: "contain",
            minHeight: "clamp(220px, 42vh, 380px)",
          }}
        >
          {SLIDES.map((slide) => (
            <div
              key={slide.lang}
              style={{
                flex: "0 0 100%",
                scrollSnapAlign: "center",
                scrollSnapStop: "always",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 14,
                padding: "0 8px",
              }}
            >
              {slide.lang !== "English" && (
                <p
                  className="eyebrow"
                  style={{ fontSize: "0.85rem", color: "var(--gold-600)", margin: 0 }}
                >
                  {`Invocation in ${slide.lang}`}
                </p>
              )}

              <p
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  fontWeight: 500,
                  fontSize: "clamp(1.5rem, 3.2vw, 2.4rem)",
                  lineHeight: 1.55,
                  maxWidth: "100%",
                  color: TEXT_BLUE,
                  margin: 0,
                }}
              >
                {slide.text}
              </p>
            </div>
          ))}
        </div>

        <Caret dir="next" onClick={() => scrollBySlide(1)} />
      </div>
    </div>
  );
}
