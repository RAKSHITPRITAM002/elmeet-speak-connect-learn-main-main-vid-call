
import React from "react";

/**
 * Enhanced Stylized tree as a decorative backdrop, embracing the user-requested yellow and blue colors
 * adapted from the tree logo in the provided image. The shapes and lines remain subtle and light.
 */
export function TreeBackdrop() {
  return (
    <svg
      className="absolute left-0 top-0 w-auto h-full min-h-[500px] pointer-events-none select-none z-0"
      viewBox="0 0 260 600"
      fill="none"
      aria-hidden="true"
      style={{
        opacity: 0.15,
        mixBlendMode: "lighten",
        maxHeight: "90vh",
      }}
    >
      {/* Main white trunk (left) */}
      <path
        d="M90 580 Q60 400 110 250 Q140 160 70 105"
        stroke="#FFFFFF"
        strokeWidth="13"
        strokeLinecap="round"
        fill="none"
      />
      {/* Orange/yellow trunk (right) */}
      <path
        d="M150 590 Q180 410 170 230 Q160 120 130 60"
        stroke="#FFC32B"  /* bright yellow from image */
        strokeWidth="13"
        strokeLinecap="round"
        fill="none"
      />
      {/* Branches */}
      <path
        d="M110 250 Q55 170 95 130"
        stroke="#FFFFFF"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M170 230 Q205 120 150 90"
        stroke="#33C3F0"  /* sky blue from dashboard colors */
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
      {/* Dots/accents (yellow and blue) */}
      <circle cx="80" cy="115" r="8" fill="#FFC32B" />
      <circle cx="135" cy="66" r="7" fill="#33C3F0" />
      <circle cx="120" cy="170" r="5.5" fill="#FFFFFF" />
      <circle cx="188" cy="120" r="6" fill="#33C3F0" />
      <circle cx="110" cy="210" r="4.5" fill="#FFC32B" />
      <circle cx="145" cy="135" r="4" fill="#FFFFFF" />
      <circle cx="75" cy="200" r="3" fill="#33C3F0" />
    </svg>
  );
}
