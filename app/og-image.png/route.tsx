import { ImageResponse } from "next/og";

export const runtime = "edge";
export const contentType = "image/png";
export const size = { width: 1200, height: 800 }; // 3:2 ratio as required by Farcaster

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%",
          background: "linear-gradient(160deg, #c8e8ff 0%, #e8f5ff 40%, #fff8e8 100%)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background blobs */}
        <div style={{
          position: "absolute", width: 600, height: 400,
          borderRadius: "50%", left: -100, top: -100,
          background: "rgba(108,180,238,.3)", filter: "blur(60px)",
        }} />
        <div style={{
          position: "absolute", width: 500, height: 500,
          borderRadius: "50%", right: -100, bottom: -100,
          background: "rgba(255,204,68,.18)", filter: "blur(60px)",
        }} />

        {/* Content */}
        <div style={{ fontSize: 90, marginBottom: 20 }}>⛅</div>
        <div style={{
          fontSize: 62, fontWeight: 900, color: "#0d2b45",
          letterSpacing: -2, marginBottom: 10,
        }}>
          Weather-Farcaster
        </div>
        <div style={{ fontSize: 28, color: "#6a94b8", fontWeight: 300 }}>
          Live Wettervorhersage · 3-Tages-Übersicht
        </div>
        <div style={{
          marginTop: 40,
          background: "rgba(26,127,207,.15)",
          border: "2px solid rgba(26,127,207,.3)",
          borderRadius: 99, padding: "12px 32px",
          fontSize: 24, color: "#1a7fcf", fontWeight: 600,
        }}>
          🌤️ Show Weather Forecast
        </div>
      </div>
    ),
    { ...size }
  );
}
