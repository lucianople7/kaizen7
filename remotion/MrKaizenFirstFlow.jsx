import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const gold = "#f1c75b";
const cyan = "#1dd8ff";
const pink = "#ff4cb8";
const green = "#9be23f";

function clamp(frame, input, output) {
  return interpolate(frame, input, output, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
}

function Honeycomb() {
  return (
    <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, opacity: 0.19 }}>
      <defs>
        <pattern id="hex" width="104" height="90" patternUnits="userSpaceOnUse">
          <path d="M26 0h52l26 45-26 45H26L0 45Z" fill="none" stroke={gold} strokeWidth="2" />
        </pattern>
      </defs>
      <rect width="1080" height="1920" fill="url(#hex)" />
    </svg>
  );
}

function EnergyRing() {
  const frame = useCurrentFrame();
  return (
    <svg width="540" height="540" viewBox="0 0 540 540" style={{ position: "absolute", top: 124, left: 270 }}>
      <circle
        cx="270"
        cy="270"
        r="188"
        fill="none"
        stroke={gold}
        strokeWidth="16"
        strokeLinecap="round"
        strokeDasharray="52 26 8 18"
        style={{
          rotate: `${frame * 0.18}deg`,
          transformOrigin: "270px 270px",
          opacity: 0.88,
        }}
      />
      <circle cx="270" cy="270" r="126" fill="rgba(0,0,0,0.24)" stroke="rgba(255,255,255,0.18)" strokeWidth="2" />
    </svg>
  );
}

function BrandHeader() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <div style={{ fontSize: 30, color: "#f6f2e8", letterSpacing: 8 }}>FLOWMATIK PRESENTA</div>
      <div style={{ fontSize: 82, color: gold, fontWeight: 800 }}>MR. KAIZEN</div>
      <div style={{ fontSize: 34, color: "#ffffff" }}>Bangkok Energy / THE FOCUX</div>
    </div>
  );
}

function Shot({ shot, index }) {
  const frame = useCurrentFrame();
  const opacity = clamp(frame, [0, 16], [0, 1]);
  const translate = clamp(frame, [0, 24], [54, 0]);
  const accent = [gold, cyan, pink, green, gold][index % 5];

  return (
    <AbsoluteFill
      style={{
        opacity,
        translate: `0 ${translate}px`,
        justifyContent: "center",
        alignItems: "center",
        padding: "0 86px",
      }}
    >
      <div
        style={{
          width: "100%",
          minHeight: 560,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 42,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 36,
            color: accent,
            fontWeight: 800,
            letterSpacing: 4,
          }}
        >
          {shot.time}
        </div>
        <div
          style={{
            fontSize: 86,
            lineHeight: 1.04,
            fontWeight: 900,
            color: "#ffffff",
            textShadow: "0 10px 32px rgba(0,0,0,0.55)",
          }}
        >
          {shot.text}
        </div>
        <div
          style={{
            width: 720,
            fontSize: 34,
            lineHeight: 1.22,
            color: "#e9e1d1",
          }}
        >
          {shot.scene}
        </div>
      </div>
    </AbsoluteFill>
  );
}

function Footer({ flow }) {
  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        right: 80,
        bottom: 82,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        color: "#f8efd7",
        fontSize: 30,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ color: gold, fontWeight: 800 }}>THE FOCUX</div>
        <div style={{ fontSize: 24 }}>criterio premium, sin ruido</div>
      </div>
      <div style={{ display: "flex", gap: 16 }}>
        {[gold, cyan, pink].map((color) => (
          <div key={color} style={{ width: 18, height: 18, borderRadius: 999, background: color }} />
        ))}
      </div>
    </div>
  );
}

export const MrKaizenFirstFlow = ({ flow }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const shots = flow.storyboard || [];
  const introOpacity = clamp(frame, [0, 24, 116, 142], [0, 1, 1, 0]);

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 18%, rgba(241,199,91,0.24), transparent 28%), linear-gradient(160deg, #050505 0%, #17110a 52%, #060606 100%)",
        fontFamily: "Arial, Helvetica, sans-serif",
        overflow: "hidden",
      }}
    >
      <Audio src={staticFile("flowmatik/first_flow/music.wav")} volume={0.16} loop />
      <Audio src={staticFile("flowmatik/first_flow/voice.wav")} volume={1} />
      <Honeycomb />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 18% 76%, rgba(29,216,255,0.18), transparent 28%), radial-gradient(circle at 82% 68%, rgba(255,76,184,0.15), transparent 26%)",
        }}
      />
      <EnergyRing />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 720, opacity: introOpacity }}>
        <BrandHeader />
      </AbsoluteFill>
      {shots.map((shot, index) => (
        <Sequence key={shot.time} from={150 + index * fps * 5} durationInFrames={fps * 5}>
          <Shot shot={shot} index={index} />
        </Sequence>
      ))}
      <Footer flow={flow} />
    </AbsoluteFill>
  );
};
