import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#1a2744] text-white/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-[#c9a84c] font-bold text-lg mb-3">SamaSangha</h3>
          <p className="text-sm leading-relaxed">
            Northeast Sufi Circle — a community on the path of love, harmony, and
            beauty. Based in Massachusetts.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-white">Quick Links</h4>
          <ul className="space-y-1 text-sm">
            {[
              ["About Us", "/about"],
              ["Teachings", "/teachings"],
              ["Events", "/events"],
              ["Dances of Universal Peace", "/teachings/dances"],
              ["Music", "/teachings/music"],
              ["Contact", "/contact"],
            ].map(([label, href]) => (
              <li key={href}>
                <Link href={href} className="hover:text-[#c9a84c] transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-white">Stay Connected</h4>
          <p className="text-sm mb-2">
            Join our mailing list for news and upcoming events.
          </p>
          <Link
            href="/contact"
            className="inline-block mt-2 px-4 py-2 bg-[#c9a84c] hover:bg-[#b8973b] text-white text-sm rounded transition-colors"
          >
            Subscribe
          </Link>
        </div>
      </div>
      <div className="border-t border-white/10 text-center text-xs py-4 text-white/40">
        © {new Date().getFullYear()} SamaSangha / Northeast Sufi Circle. All rights reserved.
      </div>
    </footer>
  );
}
