import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const SITE_NAME = "Hinn.dev";

export default function OpengraphImage() {
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 24,
          }}
        >
          {/* Simple H monogram tile */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              background: "#1a73e8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ width: 10, height: 40, borderRadius: 6, background: "#fff" }} />
              <div style={{ width: 10, height: 40, borderRadius: 6, background: "#fff" }} />
            </div>
          </div>
          <div style={{ fontSize: 48, color: "#fff", fontWeight: 700 }}>{SITE_NAME}</div>
        </div>
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
