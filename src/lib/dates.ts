import { workspace } from "../data/boards";

export function today(): Date {
  const d = workspace.today ? new Date(`${workspace.today}T12:00:00`) : new Date();
  d.setHours(12, 0, 0, 0);
  return d;
}

const DAY = 86_400_000;

export function daysUntil(due: string): number {
  return Math.round((new Date(`${due}T12:00:00`).getTime() - today().getTime()) / DAY);
}

export type DueState = "overdue" | "soon" | "later";

export function dueState(due: string): DueState {
  const d = daysUntil(due);
  if (d < 0) return "overdue";
  if (d <= 2) return "soon";
  return "later";
}

const fmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
export function shortDate(due: string): string {
  return fmt.format(new Date(`${due}T12:00:00`));
}

export function dueText(due: string): string {
  const d = daysUntil(due);
  if (d === 0) return "Due today";
  if (d === 1) return "Due tomorrow";
  if (d < 0) return `${-d} ${d === -1 ? "day" : "days"} late`;
  return shortDate(due);
}

export function todayLabel(): string {
  return new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(today());
}
