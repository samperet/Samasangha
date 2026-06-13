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
};

export default nextConfig;
