import type { Metadata } from "next";
import "./globals.css";

// ─── Farcaster Mini App Embed ─────────────────────────────────────────────────
// Replace YOUR_DOMAIN with your actual Vercel deployment URL (e.g. weather-farcaster.vercel.app)
const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN ?? "YOUR_DOMAIN.vercel.app";
const APP_URL = `https://${DOMAIN}`;

const embedJson = JSON.stringify({
  version: "1",
  imageUrl: `${APP_URL}/og-image.png`,
  button: {
    title: "🌤️ Show Weather",
    action: {
      type: "launch_frame",
      name: "Weather Farcaster",
      url: APP_URL,
      splashImageUrl: `${APP_URL}/icons/splash.png`,
      splashBackgroundColor: "#dff0ff",
    },
  },
});

export const metadata: Metadata = {
  title: "Weather Farcaster",
  description: "Lokale Wettervorhersage für die nächsten 3 Tage – direkt in Farcaster",
  openGraph: {
    title: "Weather Farcaster 🌤️",
    description: "Aktuelle Wettervorhersage für deinen Standort",
    images: [`${APP_URL}/og-image.png`],
  },
  other: {
    // Primary Mini App embed tag
    "fc:miniapp": embedJson,
    // Backward-compat for legacy clients
    "fc:frame": embedJson,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
