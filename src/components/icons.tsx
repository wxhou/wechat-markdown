/**
 * Site logo SVG — verbatim from the original AGPL-3.0 project
 * (https://studio.yituohub.com/, https://github.com/yan9651688/yituo-hub).
 */
export function LogoSvg({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <defs>
        <linearGradient id="yt-logo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#33546F" />
          <stop offset="1" stopColor="#1D3045" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#yt-logo)" />
      <g stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round">
        <line x1="24" y1="27" x2="24" y2="14" />
        <line x1="24" y1="27" x2="13.5" y2="34.5" />
        <line x1="24" y1="27" x2="34.5" y2="34.5" />
      </g>
      <circle cx="24" cy="27" r="4.4" fill="#FFFFFF" />
      <circle cx="24" cy="12.8" r="3.1" fill="#FFFFFF" />
      <circle cx="12.8" cy="35.2" r="3.1" fill="#FFFFFF" />
      <circle cx="35.2" cy="35.2" r="3.1" fill="#FFFFFF" />
    </svg>
  );
}

export function ArrowRightIcon({ size = 16, strokeWidth = 2 }: { size?: number; strokeWidth?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export function ArrowLeftIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}

export function DownloadIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

export function ImageIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  );
}

export function ChevronIcon({ size = 10 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
