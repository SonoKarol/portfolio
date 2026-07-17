import { ImageResponse } from "next/og";
import { SITE_DESCRIPTION } from "@/lib/site";

/**
 * Open Graph image generata proceduralmente a build time (route statica →
 * nessun costo a runtime). Palette allineata ai token di design:
 * surface #08060f, brand-violet #8b5cf6, brand-cyan #22d3ee — tenere in
 * sync con globals.css (@theme) e con gli shader dell'hero.
 */

export const alt = SITE_DESCRIPTION;

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#08060f",
          backgroundImage:
            "radial-gradient(circle at 18% 12%, rgba(139, 92, 246, 0.28), transparent 55%), radial-gradient(circle at 85% 90%, rgba(34, 211, 238, 0.22), transparent 50%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Barra accento gradiente violet→cyan, come i heading del sito */}
        <div
          style={{
            width: "120px",
            height: "10px",
            borderRadius: "5px",
            backgroundImage: "linear-gradient(90deg, #8b5cf6, #22d3ee)",
            marginBottom: "44px",
          }}
        />
        <div
          style={{
            fontSize: "112px",
            fontWeight: 700,
            color: "#fafafa",
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}
        >
          Karol
        </div>
        <div
          style={{
            marginTop: "28px",
            fontSize: "40px",
            color: "#a1a1aa",
            letterSpacing: "-0.01em",
          }}
        >
          Creative developer — web e 3D interattivo
        </div>
        <div
          style={{
            marginTop: "56px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: "28px",
            color: "#67e8f9",
          }}
        >
          <div
            style={{
              width: "14px",
              height: "14px",
              borderRadius: "7px",
              backgroundColor: "#8b5cf6",
              boxShadow: "0 0 24px rgba(139, 92, 246, 0.9)",
            }}
          />
          github.com/SonoKarol
        </div>
      </div>
    ),
    size,
  );
}
