import Link from "next/link";
import Image from "next/image";

function FacebookIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function InstagramIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer
      style={{
        background:
          "radial-gradient(120% 130% at 50% -10%, #0a7d12 0%, #036007 50%, #024c06 100%)",
        backgroundColor: "#036007",
        color: "var(--fg-on-dark)",
      }}
      className="mt-auto"
    >
      <div className="max-w-5xl mx-auto px-5 py-8 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-center">
        {/* Inspiration */}
        <div className="flex justify-center">
          <Image
            src="/assets/golden-footprints.png"
            alt="Golden footprints inscribed with sacred symbols"
            width={1108}
            height={1172}
            className="h-auto w-full max-w-[170px] sm:max-w-[210px] opacity-70"
          />
        </div>

        <div className="flex flex-col items-center md:items-start gap-4">
          <Link
            href="/mureeds-circle"
            className="inline-flex h-12 w-full max-w-xs items-center justify-center gap-3 rounded-lg px-5 text-sm font-semibold"
            style={{
              background: "var(--parch-50)",
              color: "var(--ink-900)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
              border: "1px solid var(--gold-400)",
            }}
          >
            <Image
              src="/assets/sufi-heart-banner.png"
              alt=""
              aria-hidden
              width={600}
              height={272}
              className="w-auto h-8"
            />
            Mureeds Circle
          </Link>
          <a
            href="https://wordpress.us2.list-manage.com/subscribe?u=dbca5f3f5422b598395d3eaa1&id=b9cee861d5"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-cta inline-flex h-12 w-full max-w-xs items-center justify-center rounded-lg px-5 text-sm font-semibold"
          >
            Join the mailing list
          </a>
          <a
            href="https://www.paypal.com/donate/?hosted_button_id=77ADFBGTTU2QE"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-donate inline-flex h-12 w-full max-w-xs items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold"
          >
            ♡ Donate
          </a>
          {/* Socials, under the Donate button */}
          <div className="flex items-center justify-center gap-x-5 gap-y-2 w-full max-w-xs">
            <a
              href="https://www.facebook.com/groups/148665083286"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link inline-flex items-center gap-2 text-sm"
            >
              <FacebookIcon /> Facebook
            </a>
            <a
              href="https://www.instagram.com/dup.cambridge.ma/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link inline-flex items-center gap-2 text-sm"
            >
              <InstagramIcon /> Instagram
            </a>
          </div>
        </div>
      </div>

      {/* Prayer */}
      <div
        className="text-center py-4 px-4"
        style={{ borderTop: "1px solid rgba(201,162,44,.10)" }}
      >
        <p
          className="font-serif"
          aria-label="HEART"
          style={{
            color: "var(--gold-400)",
            opacity: 0.75,
            fontSize: "0.95rem",
            letterSpacing: "0.06em",
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
        >
          {"HEART".repeat(120)}
        </p>
      </div>
    </footer>
  );
}
