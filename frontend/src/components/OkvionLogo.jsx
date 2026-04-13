import { useEffect, useRef, useState } from "react";

/**
 * OkvionLogo – animované SVG logo s "živým okem".
 * Props:
 *   size      – px rozměr (default 36)
 *   className – volitelná třída
 */
export default function OkvionLogo({ size = 36, className = "" }) {
  const gradId = "gradBird";
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Stavy oka: "idle" | "blink" | "sleepy" | "angry"
  const [eyeState, setEyeState] = useState("idle");
  // Jemný offset oka při idle
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const timerRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const schedule = () => {
      // Náhodný interval mezi akcemi: 2.5–7 vteřin
      const delay = 2500 + Math.random() * 4500;
      timerRef.current = setTimeout(() => {
        const roll = Math.random();

        if (roll < 0.40) {
          // Idle pohyb oka – jemný look
          const ox = (Math.random() - 0.5) * 2.2;
          const oy = (Math.random() - 0.5) * 1.4;
          setEyeOffset({ x: ox, y: oy });
          setEyeState("idle");
          // Vrátit do střední pozice po 1.2s
          setTimeout(() => setEyeOffset({ x: 0, y: 0 }), 1200);
        } else if (roll < 0.65) {
          // Mrknutí – krátké
          setEyeState("blink");
          setTimeout(() => setEyeState("idle"), 160);
        } else if (roll < 0.82) {
          // Ospalé oko
          setEyeState("sleepy");
          setTimeout(() => setEyeState("idle"), 700);
        } else {
          // Naštvaný výraz
          setEyeState("angry");
          setTimeout(() => setEyeState("idle"), 900);
        }

        schedule();
      }, delay);
    };

    schedule();
    return () => clearTimeout(timerRef.current);
  }, [prefersReducedMotion]);

  // Parametry oka podle stavu
  const eyeCx = 58 + eyeOffset.x;
  const eyeCy = 44 + eyeOffset.y;

  const renderEye = () => {
    if (eyeState === "blink" || eyeState === "sleepy") {
      // Tenká horizontální čárka = zavřené oko
      const lineWidth = eyeState === "sleepy" ? 5 : 6;
      return (
        <line
          x1={eyeCx - lineWidth / 2}
          y1={eyeCy}
          x2={eyeCx + lineWidth / 2}
          y2={eyeCy}
          stroke="#F3F4F6"
          strokeWidth="1.8"
          strokeLinecap="round"
          style={{ transition: "all 0.08s ease" }}
        />
      );
    }
    return (
      <circle
        cx={eyeCx}
        cy={eyeCy}
        r="3"
        fill="#F3F4F6"
        style={{ transition: "cx 0.35s ease, cy 0.35s ease" }}
      />
    );
  };

  const renderBrow = () => {
    if (eyeState !== "angry") return null;
    // Jemné šikmé obočí nad okem
    return (
      <line
        x1={eyeCx - 3.5}
        y1={eyeCy - 5.5}
        x2={eyeCx + 3.5}
        y2={eyeCy - 4}
        stroke="#F3F4F6"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.85"
      />
    );
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`okvion-logo-svg ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#8A2387" />
          <stop offset="50%"  stopColor="#E94057" />
          <stop offset="100%" stopColor="#F27121" />
        </linearGradient>
      </defs>

      {/* Kruh */}
      <circle
        cx="50" cy="50" r="34"
        stroke={`url(#${gradId})`}
        strokeWidth="7"
        fill="none"
      />

      {/* Šipka / ocas */}
      <path
        d="M84 50 L96 42 M84 50 L96 58"
        stroke={`url(#${gradId})`}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Obočí (angry state) */}
      {renderBrow()}

      {/* Oko */}
      {renderEye()}
    </svg>
  );
}
