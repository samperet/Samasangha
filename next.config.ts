import type { NextConfig } from "next";

// Allow next/image to optimize files served from the Cloudflare R2 public
// bucket (admin-uploaded media). Derived from R2_PUBLIC_URL so there's nothing
// to hardcode, set that env var and the hostname is allowlisted automatically.
const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [];
if (process.env.R2_PUBLIC_URL) {
  try {
    const { protocol, hostname } = new URL(process.env.R2_PUBLIC_URL);
    remotePatterns.push({
      protocol: protocol.replace(":", "") as "http" | "https",
      hostname,
    });
  } catch {
    // ignore malformed R2_PUBLIC_URL
  }
}

const nextConfig: NextConfig = {
  images: { remotePatterns },
  // Mureeds' Corner was renamed to Mureeds Circle; keep old links working.
  // /deepen was renamed to /teachings; keep old links working too.
  async redirects() {
    return [
      // Halima and Abraham's bios were combined into one page.
      { source: "/welcome/halima-sussman", destination: "/welcome/halima-and-abraham", permanent: true },
      { source: "/welcome/abraham-sussman", destination: "/welcome/halima-and-abraham", permanent: true },
      // ...and the old site's own URLs for that combined bio.
      { source: "/abraham-halima-sussman", destination: "/welcome/halima-and-abraham", permanent: true },
      { source: "/abraham-halima-2", destination: "/welcome/halima-and-abraham", permanent: true },
      // The Welcome page (and the bios under it) moved out of /about.
      { source: "/about/teachers", destination: "/welcome", permanent: true },
      { source: "/about/teachers/:path*", destination: "/welcome/:path*", permanent: true },
      { source: "/mureeds-corner", destination: "/mureeds-circle", permanent: true },
      { source: "/mureeds-corner/:path*", destination: "/mureeds-circle/:path*", permanent: true },
      { source: "/deepen", destination: "/teachings", permanent: true },
      { source: "/deepen/:path*", destination: "/teachings/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
