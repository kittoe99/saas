import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          background: "linear-gradient(135deg, #0e0b08 0%, #1a73e8 100%)",
          padding: 64,
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        <div style={{ fontSize: 56, color: "#fff", fontWeight: 800, marginBottom: 16 }}>Hinn.dev</div>
        <div style={{ color: "#fff", opacity: 0.95, fontSize: 28, lineHeight: 1.35, maxWidth: 980 }}>
          Pay‑by‑month, all‑inclusive website design. Design + hosting + monthly updates.
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
