import { NextResponse } from "next/server";

export async function GET() {
  const domain = process.env.NEXT_PUBLIC_DOMAIN ?? "weather-farcaster.vercel.app";
  const appUrl = `https://${domain}`;

  return NextResponse.json({
    accountAssociation: {
      header:    process.env.FC_HEADER    ?? "",
      payload:   process.env.FC_PAYLOAD   ?? "",
      signature: process.env.FC_SIGNATURE ?? "",
    },
    miniapp: {
      version:               "1",
      name:                  "Weather Farcaster",
      iconUrl:               `${appUrl}/icons/icon.png`,
      homeUrl:               appUrl,
      imageUrl:              `${appUrl}/og-image.png`,
      buttonTitle:           "🌤️ Show Weather",
      splashImageUrl:        `${appUrl}/icons/splash.png`,
      splashBackgroundColor: "#dff0ff",
    },
  });
}
