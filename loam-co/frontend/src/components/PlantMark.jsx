// A small set of hand-drawn-style SVG plant glyphs used in place of photography,
// keeping the app fully self-contained (no external image hosts required).
const PALETTES = {
  moss: "#1f2e1a",
  sage: "#6b7f5e",
  clay: "#c8763e",
};

export default function PlantMark({ seed = "", size = 64, tone = "moss" }) {
  // Deterministic pseudo-random variation from the seed string, so each
  // product gets a consistent but distinct little sprig illustration.
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) % 1000;
  const leafCount = 3 + (hash % 3);
  const tilt = (hash % 40) - 20;
  const color = PALETTES[tone] || PALETTES.moss;

  const leaves = Array.from({ length: leafCount }).map((_, i) => {
    const angle = -60 + (i * 120) / Math.max(leafCount - 1, 1);
    return (
      <ellipse
        key={i}
        cx="0"
        cy="-26"
        rx="9"
        ry="20"
        fill={color}
        opacity={0.85 - i * 0.08}
        transform={`rotate(${angle})`}
      />
    );
  });

  return (
    <svg width={size} height={size} viewBox="-40 -60 80 90" role="img" aria-label="plant illustration">
      <g transform={`rotate(${tilt})`}>
        <rect x="-3" y="-30" width="6" height="34" rx="3" fill={color} opacity="0.9" />
        {leaves}
      </g>
      <path d="M -22 4 Q 0 -6 22 4 L 20 26 Q 0 34 -20 26 Z" fill="#c8763e" opacity="0.18" />
    </svg>
  );
}
