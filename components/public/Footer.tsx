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
    <footer style={{ background: "var(--bg-ink)", color: "var(--fg-on-dark)" }} className="mt-auto">
      {/* Calligraphy divider */}
      <div className="flex items-center justify-center py-8 px-4" style={{ borderBottom: "1px solid rgba(201,162,44,.14)" }}>
        <div className="flex items-center gap-4">
          <span style={{ width: 72, height: 1, background: "var(--gold-700)", opacity: 0.5, display: "block" }} />
          <Image
            src="/assets/heart-wing-calligraphy-gold.png"
            alt=""
            width={120}
            height={36}
            className="opacity-70"
          />
          <span style={{ width: 72, height: 1, background: "var(--gold-700)", opacity: 0.5, display: "block" }} />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <Image src="/assets/sufi-heart-banner.png" alt="" width={600} height={272} className="w-auto h-6 opacity-90" />
            <span className="font-serif text-lg" style={{ color: "var(--gold-400)" }}>SamaSangha</span>
          </div>
          <p className="text-sm leading-relaxed footer-muted">
            Sama Sangha — a community on the path of love, harmony, and beauty.
            Gathering in Cambridge, Massachusetts since 1972.
          </p>
        </div>

        {/* Links */}
        <div>
          <p className="eyebrow mb-4" style={{ color: "var(--gold-600)" }}>Explore</p>
          <ul className="space-y-2 text-sm">
            {[
              ["Our story", "/about/our-story"],
              ["Tuesday practice", "/teachings/tuesday-practice"],
              ["Upcoming events", "/events/upcoming"],
              ["Music & recordings", "/teachings/music/albums"],
              ["Contact", "/contact"],
            ].map(([label, href]) => (
              <li key={href}>
                <Link href={href} className="footer-link">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Connect */}
        <div>
          <p className="eyebrow mb-4" style={{ color: "var(--gold-600)" }}>Stay connected</p>
          <p className="text-sm leading-relaxed mb-5 footer-muted">
            Receive word of gatherings, retreats, and teachings — a few times a season.
          </p>
          <Link
            href="/contact"
            className="footer-cta inline-block text-sm font-semibold px-5 py-2.5 rounded-lg"
          >
            Join the mailing list
          </Link>

          <div className="mt-6 pt-5" style={{ borderTop: "1px solid rgba(201,162,44,.12)" }}>
            <p className="text-xs mb-3 footer-muted">Follow along</p>
            <div className="flex items-center gap-5">
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

          <div className="mt-6 pt-5" style={{ borderTop: "1px solid rgba(201,162,44,.12)" }}>
            <p className="text-xs mb-3 footer-muted">Support the community</p>
            <a
              href="https://www.paypal.com/donate/?hosted_button_id=77ADFBGTTU2QE"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-donate inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-lg"
            >
              ♡ Donate
            </a>
          </div>
        </div>
      </div>

      {/* Prayer */}
      <div
        className="text-center py-6 px-4"
        style={{ borderTop: "1px solid rgba(201,162,44,.10)" }}
      >
        <p
          className="font-serif italic"
          style={{ color: "var(--gold-400)", opacity: 0.75, fontSize: "0.95rem", lineHeight: 1.8 }}
        >
          May all Beings be Well! · May all Beings be Happy! Peace! Peace! Peace!
        </p>
      </div>

      {/* Bottom bar */}
      <div
        className="text-center text-xs py-5 px-4"
        style={{ borderTop: "1px solid rgba(201,162,44,.10)", color: "var(--fg-on-dark)", opacity: 0.35 }}
      >
        © {new Date().getFullYear()} SamaSangha
      </div>
    </footer>
  );
}
