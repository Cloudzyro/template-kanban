import { members, type Member } from "../data/boards";

export const memberById = (id: string): Member | undefined => members.find((m) => m.id === id);

export function Avatar({ id, size = 24, ring = true }: { id: string; size?: number; ring?: boolean }) {
  const m = memberById(id);
  if (!m) return null;
  return (
    <span
      title={m.name}
      className="inline-grid shrink-0 place-items-center rounded-full font-medium text-[#2b2925]"
      style={{ width: size, height: size, background: m.tone, fontSize: size < 24 ? 10 : 11, boxShadow: ring ? "0 0 0 2px var(--card)" : undefined }}
    >
      <span aria-hidden="true">{m.initials}</span>
      <span className="sr-only">{m.name}</span>
    </span>
  );
}

export function AvatarStack({ ids, size = 24, max = 3 }: { ids: string[]; size?: number; max?: number }) {
  const shown = ids.slice(0, max);
  const extra = ids.length - shown.length;
  return (
    <span className="flex items-center -space-x-1">
      {shown.map((id) => (
        <Avatar key={id} id={id} size={size} />
      ))}
      {extra > 0 && <span className="num pl-2.5 text-xs text-muted">+{extra}</span>}
    </span>
  );
}
