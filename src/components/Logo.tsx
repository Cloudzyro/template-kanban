// Two offset index cards: the studio's board mark.
export function LogoMark({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="2.5" y="5" width="13" height="15" rx="2.5" fill="var(--fg)" opacity="0.18" />
      <rect x="8.5" y="3" width="13" height="15" rx="2.5" fill="var(--fg)" />
      <path d="M11 7.5h8" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
