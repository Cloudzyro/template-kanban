import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { AvatarStack } from "../components/Avatar";
import { Icon } from "../components/Icon";
import type { Board, Card } from "../data/boards";
import { dueState, dueText, todayLabel } from "../lib/dates";
import { actions, useBoards } from "../lib/store";
import { useTitle } from "../lib/useTitle";

const doneColumn = (b: Board) => b.columns[b.columns.length - 1];

function stats(b: Board) {
  const total = Object.keys(b.cards).length;
  const done = doneColumn(b)?.cardIds.length ?? 0;
  const open = b.columns
    .slice(0, -1)
    .flatMap((col) => col.cardIds.map((id) => b.cards[id]))
    .filter((c): c is Card => Boolean(c));
  const nextDue = open.filter((c) => c.due).sort((a, z) => a.due!.localeCompare(z.due!))[0];
  const people = [...new Set(Object.values(b.cards).flatMap((c) => c.assignees))];
  return { total, done, nextDue, people };
}

// Neutral steps for the open columns; the last column ("Done") is the darkest, since it's the progress.
const steps = ["color-mix(in srgb, var(--fg) 16%, transparent)", "color-mix(in srgb, var(--fg) 32%, transparent)", "color-mix(in srgb, var(--fg) 50%, transparent)", "color-mix(in srgb, var(--fg) 66%, transparent)"];

function ColumnBar({ board }: { board: Board }) {
  const total = Object.keys(board.cards).length || 1;
  const last = board.columns.length - 1;
  return (
    <div>
      <div className="flex h-2 overflow-hidden rounded-full bg-raised" aria-hidden="true">
        {board.columns.map((col, i) =>
          col.cardIds.length ? (
            <span
              key={col.id}
              className="h-full border-r-2 border-card last:border-r-0"
              style={{ width: `${(col.cardIds.length / total) * 100}%`, background: i === last ? "var(--fg)" : steps[Math.min(i, steps.length - 1)] }}
            />
          ) : null,
        )}
      </div>
      <p className="sr-only">{board.columns.map((col) => `${col.title}: ${col.cardIds.length}`).join(", ")}</p>
    </div>
  );
}

function NewProject({ onDone }: { onDone: () => void }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [client, setClient] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const id = actions.addBoard(name.trim(), client.trim() || "Internal");
    onDone();
    navigate(`/board/${id}`);
  };
  return (
    <form onSubmit={submit} className="fade-in mb-6 grid gap-3 rounded-2xl border border-line bg-card p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <label className="grid gap-1.5">
        <span className="text-[13px] text-fg-2">Project name</span>
        <input
          autoFocus
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Spring catalog"
          className="h-10 rounded-lg border border-line-strong bg-card px-3 placeholder:text-muted"
        />
      </label>
      <label className="grid gap-1.5">
        <span className="text-[13px] text-fg-2">Client</span>
        <input
          value={client}
          onChange={(e) => setClient(e.target.value)}
          placeholder="Optional"
          className="h-10 rounded-lg border border-line-strong bg-card px-3 placeholder:text-muted"
        />
      </label>
      <div className="flex gap-2">
        <button type="submit" className="h-10 rounded-lg bg-fg px-4 font-medium text-page transition-colors duration-150 hover:bg-fg/85">
          Create board
        </button>
        <button type="button" onClick={onDone} className="h-10 rounded-lg px-3 text-fg-2 transition-colors duration-150 hover:bg-raised hover:text-fg">
          Cancel
        </button>
      </div>
    </form>
  );
}

export function Projects() {
  useTitle("Projects");
  const boards = useBoards();
  const [adding, setAdding] = useState(false);

  const upcoming = boards
    .flatMap((b) =>
      b.columns.slice(0, -1).flatMap((col) =>
        col.cardIds
          .map((id) => b.cards[id])
          .filter((c): c is Card => Boolean(c?.due))
          .map((card) => ({ card, board: b, column: col.title })),
      ),
    )
    .sort((a, z) => a.card.due!.localeCompare(z.card.due!))
    .slice(0, 7);

  const totalOpen = boards.reduce((n, b) => n + Object.keys(b.cards).length - (doneColumn(b)?.cardIds.length ?? 0), 0);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-fg-2">{todayLabel()}</p>
          <h1 className="mt-1 text-[32px] font-medium leading-tight tracking-[-0.01em]">Projects</h1>
          <p className="num mt-1 text-fg-2">
            {boards.length} boards, {totalOpen} open cards
          </p>
        </div>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex h-10 items-center gap-2 rounded-lg bg-accent px-4 font-medium text-accent-ink transition-colors duration-150 hover:bg-accent/90"
          >
            <Icon name="plus" />
            New project
          </button>
        )}
      </div>

      {adding && <NewProject onDone={() => setAdding(false)} />}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section aria-labelledby="boards-heading">
          <h2 id="boards-heading" className="sr-only">
            Boards
          </h2>
          <ul className="overflow-hidden rounded-2xl border border-line bg-card">
            {boards.map((b) => {
              const s = stats(b);
              return (
                <li key={b.id} className="border-b border-line last:border-b-0">
                  <Link to={`/board/${b.id}`} className="group block px-5 py-5 transition-colors duration-150 hover:bg-raised/60 sm:px-6">
                    <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
                      <div className="min-w-0">
                        <h3 className="text-base font-medium group-hover:underline group-hover:decoration-line-strong group-hover:underline-offset-4">{b.name}</h3>
                        <p className="mt-0.5 text-fg-2">{b.client}</p>
                        {b.summary && <p className="mt-0.5 hidden text-[13px] text-muted md:block">{b.summary}</p>}
                      </div>
                      <AvatarStack ids={s.people} max={4} />
                    </div>
                    <div className="mt-4">
                      <ColumnBar board={b} />
                    </div>
                    <div className="num mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[13px] text-fg-2">
                      <span>
                        <span className="text-fg">{s.done}</span> of {s.total} done
                      </span>
                      {s.nextDue ? (
                        <span className={dueState(s.nextDue.due!) === "overdue" ? "text-late" : ""}>
                          Next: {s.nextDue.title.length > 38 ? `${s.nextDue.title.slice(0, 38).trimEnd()}...` : s.nextDue.title}, {dueText(s.nextDue.due!).toLowerCase()}
                        </span>
                      ) : (
                        <span>Nothing due</span>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
            {boards.length === 0 && <li className="px-6 py-10 text-center text-fg-2">No projects yet. Create one to start a board.</li>}
          </ul>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full" style={{ background: steps[0] }} /> To do
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full" style={{ background: steps[1] }} /> In progress
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full" style={{ background: steps[2] }} /> With client
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-fg" /> Done
            </span>
          </div>
        </section>

        <section aria-labelledby="due-heading">
          <h2 id="due-heading" className="mb-3 text-base font-medium">
            Coming up
          </h2>
          <ol className="grid gap-1">
            {upcoming.map(({ card, board, column }) => {
              const state = dueState(card.due!);
              return (
                <li key={card.id}>
                  <Link
                    to={`/board/${board.id}?card=${card.id}`}
                    className="grid grid-cols-[64px_1fr] gap-3 rounded-lg px-3 py-2.5 transition-colors duration-150 hover:bg-card"
                  >
                    <span className={`num pt-px text-[13px] ${state === "overdue" ? "text-late" : state === "soon" ? "font-medium text-fg" : "text-fg-2"}`}>
                      {dueText(card.due!).replace("Due ", "")}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate">{card.title}</span>
                      <span className="block truncate text-[13px] text-muted">
                        {board.name}, {column}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    </div>
  );
}
