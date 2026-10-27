/** ROLEVEX logo mark — a faceted hexagon "V" used across the site. */
export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="rolevexMark" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9E86FF" />
          <stop offset="0.55" stopColor="#7C5CFF" />
          <stop offset="1" stopColor="#4E31D6" />
        </linearGradient>
      </defs>
      <path
        d="M24 2.6 42.5 13v22L24 45.4 5.5 35V13L24 2.6Z"
        fill="url(#rolevexMark)"
        fillOpacity="0.16"
        stroke="url(#rolevexMark)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M15.5 17.5 24 32l8.5-14.5"
        stroke="url(#rolevexMark)"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M24 2.6 42.5 13 24 23.4 5.5 13 24 2.6Z" fill="url(#rolevexMark)" fillOpacity="0.12" />
    </svg>
  );
}

export function LogoText() {
  return (
    <span className="font-display text-lg font-bold tracking-[0.2em] text-white">
      ROLE<span className="text-accent">VEX</span>
    </span>
  );
}
