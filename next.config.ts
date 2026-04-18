import type { NextConfig } from "next";

/**
 * Im Dev-Modus blockiert Next.js Zugriffe auf /_next/* von „fremden“ Hostnamen
 * (nur localhost ist standardmäßig erlaubt). Ohne Eintrag laden z. B. über
 * LAN-IP oder Reverse-Proxy keine Client-Chunks → kein Karussell, kein Menü.
 * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/allowedDevOrigins
 */
const extraFromEnv =
  process.env.NEXT_ALLOWED_DEV_ORIGINS?.split(/[\s,]+/).filter(Boolean) ?? [];

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.178.49",
    "food.poslab.cc",
    ...extraFromEnv,
  ],
};

export default nextConfig;
