import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { labels, members, type Board } from "../data/boards";
import { dueState, dueText } from "../lib/dates";
import { actions, uid } from "../lib/store";
import { Avatar } from "./Avatar";
import { Icon, type IconName } from "./Icon";

function Field({ icon, label, children, id }: { icon: IconName; label: string; children: ReactNode; id?: string }) {
  return (
    <div className="grid grid-cols-[112px_1fr] items-start gap-3 py-2.5 max-sm:grid-cols-1 max-sm:gap-1.5">
      <span className="flex h-8 items-center gap-2 text-fg-2" id={id}>
        <Icon name={icon} className="text-muted" />
        {label}
      </span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function CardDrawer({ board, cardId, onClose }: { board: Board; cardId: string; onClose: () => void }) {
  const card = board.cards[cardId];
  const panel = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState(card?.title ?? "");
  const [description, setDescription] = useState(card?.description ?? "");
  const [newItem, setNewItem] = useState("");
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    setTitle(card?.title ?? "");
    setDescription(card?.description ?? "");
    // Only when switching to another card.
  }, [cardId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Focus the panel on open, return focus on close, Escape closes, Tab stays inside.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
      if (e.key === "Tab" && panel.current) {
        const items = panel.current.querySelectorAll<HTMLElement>("button, input, textarea, select, [tabindex]:not([tabindex='-1'])");
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, []);

  if (!card) return null;
  const update = (patch: Parameters<typeof actions.updateCard>[2]) => actions.updateCard(board.id, card.id, patch);
  const column = board.columns.find((c) => c.cardIds.includes(card.id));
  const done = card.checklist.filter((i) => i.done).length;
  const pct = card.checklist.length ? Math.round((done / card.checklist.length) * 100) : 0;
  const toggleIn = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  const addItem = (e: FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    update({ checklist: [...card.checklist, { id: uid("item"), text: newItem.trim(), done: false }] });
    setNewItem("");
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <button type="button" aria-label="Close card" tabIndex={-1} onClick={onClose} className="fade-in absolute inset-0 cursor-default bg-black/25 dark:bg-black/50" />
      <div
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="card-title"
        className="drawer-in relative flex h-full w-full max-w-[480px] flex-col border-l border-line bg-card shadow-[var(--shadow-lift)] outline-none"
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-line px-5">
          <p className="truncate text-[13px] text-fg-2">
            {board.name}
            {column && <span className="text-muted">, {column.title}</span>}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-8 place-items-center rounded-lg text-fg-2 transition-colors duration-150 hover:bg-raised hover:text-fg"
          >
            <Icon name="x" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-8 pt-5">
          <label htmlFor="card-title" className="sr-only">
            Title
          </label>
          <textarea
            id="card-title"
            rows={2}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => title.trim() && title !== card.title && update({ title: title.trim() })}
            className="card-rule w-full resize-none rounded-md bg-transparent pb-3 text-[22px] font-medium leading-7 outline-offset-4"
          />

          <div className="mt-3 divide-y divide-line">
            <Field icon="columns" label="Column">
              <label className="sr-only" htmlFor="card-column">
                Column
              </label>
              <select
                id="card-column"
                value={column?.id}
                onChange={(e) => actions.moveCard(board.id, card.id, e.target.value)}
                className="h-8 rounded-lg border border-line-strong bg-card px-2"
              >
                {board.columns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </Field>

            <Field icon="calendar" label="Due">
              <div className="flex flex-wrap items-center gap-2">
                <label className="sr-only" htmlFor="card-due">
                  Due date
                </label>
                <input
                  id="card-due"
                  type="date"
                  value={card.due ?? ""}
                  onChange={(e) => update({ due: e.target.value || null })}
                  className="num h-8 rounded-lg border border-line-strong bg-card px-2"
                />
                {card.due && dueState(card.due) !== "later" && (
                  <span
                    className={`text-[13px] ${dueState(card.due) === "overdue" ? "text-late" : dueState(card.due) === "soon" ? "font-medium text-fg" : "text-fg-2"}`}
                  >
                    {dueText(card.due)}
                  </span>
                )}
              </div>
            </Field>

            <Field icon="tag" label="Labels" id="labels-label">
              <div className="flex flex-wrap gap-1.5" role="group" aria-labelledby="labels-label">
                {labels.map((l) => {
                  const on = card.labels.includes(l.id);
                  return (
                    <button
                      key={l.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => update({ labels: toggleIn(card.labels, l.id) })}
                      className={`flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[13px] transition-colors duration-150 ${
                        on ? "border-line-strong bg-raised text-fg" : "border-line text-fg-2 hover:bg-raised"
                      }`}
                    >
                      <span className="h-1.5 w-4 rounded-full" style={{ background: l.color, opacity: on ? 1 : 0.45 }} />
                      {l.name}
                    </button>
                  );
                })}
              </div>
            </Field>

            <Field icon="users" label="People" id="people-label">
              <div className="flex flex-wrap gap-1.5" role="group" aria-labelledby="people-label">
                {members.map((m) => {
                  const on = card.assignees.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => update({ assignees: toggleIn(card.assignees, m.id) })}
                      className={`flex h-8 items-center gap-2 rounded-lg border pl-1 pr-2.5 text-[13px] transition-colors duration-150 ${
                        on ? "border-line-strong bg-raised text-fg" : "border-line text-fg-2 hover:bg-raised"
                      }`}
                    >
                      <span className={on ? "" : "opacity-50"}>
                        <Avatar id={m.id} size={22} ring={false} />
                      </span>
                      {m.name.split(" ")[0]}
                    </button>
                  );
                })}
              </div>
            </Field>
          </div>

          <section className="mt-6">
            <h3 className="mb-2 flex items-center gap-2 font-medium">
              <Icon name="text" className="text-muted" />
              Notes
            </h3>
            <label className="sr-only" htmlFor="card-notes">
              Notes
            </label>
            <textarea
              id="card-notes"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => description !== card.description && update({ description })}
              placeholder="Add context, links or decisions"
              className="w-full resize-y rounded-xl border border-line-strong bg-card px-3 py-2.5 leading-6 placeholder:text-muted"
            />
          </section>

          <section className="mt-6" aria-labelledby="checklist-heading">
            <div className="mb-2 flex items-center justify-between">
              <h3 id="checklist-heading" className="flex items-center gap-2 font-medium">
                <Icon name="checklist" className="text-muted" />
                Checklist
              </h3>
              {card.checklist.length > 0 && (
                <span className="num text-[13px] text-fg-2">
                  {done} of {card.checklist.length}
                </span>
              )}
            </div>
            {card.checklist.length > 0 && (
              <div
                className="mb-3 h-1.5 overflow-hidden rounded-full bg-raised"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Checklist progress"
              >
                <div className="h-full rounded-full bg-fg" style={{ width: `${pct}%` }} />
              </div>
            )}
            <ul className="grid gap-0.5">
              {card.checklist.map((item) => (
                <li key={item.id} className="group flex min-h-9 items-center gap-3 rounded-lg px-2 hover:bg-raised">
                  <input
                    id={item.id}
                    type="checkbox"
                    checked={item.done}
                    onChange={() => update({ checklist: card.checklist.map((i) => (i.id === item.id ? { ...i, done: !i.done } : i)) })}
                    className="size-4 accent-[var(--fg)]"
                  />
                  <label htmlFor={item.id} className={`flex-1 py-1.5 ${item.done ? "text-muted line-through decoration-line-strong" : ""}`}>
                    {item.text}
                  </label>
                  <button
                    type="button"
                    onClick={() => update({ checklist: card.checklist.filter((i) => i.id !== item.id) })}
                    aria-label={`Remove ${item.text}`}
                    className="grid size-7 place-items-center rounded-md text-muted opacity-0 transition-opacity duration-150 hover:text-fg focus-visible:opacity-100 group-hover:opacity-100"
                  >
                    <Icon name="x" size={14} />
                  </button>
                </li>
              ))}
            </ul>
            <form onSubmit={addItem} className="mt-2 flex gap-2">
              <label className="sr-only" htmlFor="new-item">
                New checklist item
              </label>
              <input
                id="new-item"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="Add an item"
                className="h-9 min-w-0 flex-1 rounded-lg border border-line-strong bg-card px-3 placeholder:text-muted"
              />
              <button type="submit" className="h-9 rounded-lg border border-line-strong px-3 transition-colors duration-150 hover:bg-raised">
                Add
              </button>
            </form>
          </section>
        </div>

        <div className="flex shrink-0 items-center justify-between border-t border-line px-5 py-3">
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Delete "${card.title}"? This can't be undone.`)) {
                actions.deleteCard(board.id, card.id);
                onClose();
              }
            }}
            className="flex h-8 items-center gap-2 rounded-lg px-2.5 text-fg-2 transition-colors duration-150 hover:bg-raised hover:text-late"
          >
            <Icon name="trash" />
            Delete card
          </button>
          <button type="button" onClick={onClose} className="h-8 rounded-lg bg-fg px-4 font-medium text-page transition-colors duration-150 hover:bg-fg/85">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
