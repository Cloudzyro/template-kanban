import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useDroppable,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type KeyboardCoordinateGetter,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { Avatar, AvatarStack } from "../components/Avatar";
import { CardDrawer } from "../components/CardDrawer";
import { Icon } from "../components/Icon";
import { labels, members, type Board as BoardT, type Card, type Column } from "../data/boards";
import { dueState, dueText, shortDate } from "../lib/dates";
import { actions, useBoard } from "../lib/store";
import { useTitle } from "../lib/useTitle";
import { NotFound } from "./NotFound";

const labelById = (id: string) => labels.find((l) => l.id === id);

function CardFace({ card, dragging = false, finished = false }: { card: Card; dragging?: boolean; finished?: boolean }) {
  const doneItems = card.checklist.filter((i) => i.done).length;
  // Cards in the last column are finished, so their dates are history, not warnings.
  const state = card.due && !finished ? dueState(card.due) : null;
  return (
    <div
      className={`rounded-xl border bg-card px-3.5 pb-3 pt-3 text-left ${
        dragging ? "border-line-strong shadow-[var(--shadow-lift)]" : "border-line shadow-[var(--shadow)]"
      }`}
    >
      {card.labels.length > 0 && (
        <div className="mb-2.5 flex flex-wrap gap-1">
          {card.labels.map((id) => {
            const l = labelById(id);
            return l ? (
              <span key={id} title={l.name} className="h-1.5 w-7 rounded-full" style={{ background: l.color }}>
                <span className="sr-only">{l.name}</span>
              </span>
            ) : null;
          })}
        </div>
      )}
      <p className="card-rule pb-2.5 text-[14px] leading-5 text-fg">{card.title}</p>
      <div className="mt-2.5 flex min-h-6 items-center gap-3 text-[12px] text-fg-2">
        {card.due && (
          <span
            className={`num flex items-center gap-1 ${state === "overdue" ? "text-late" : state === "soon" ? "font-medium text-fg" : ""}`}
          >
            <Icon name="calendar" size={14} />
            {finished ? shortDate(card.due) : dueText(card.due)}
          </span>
        )}
        {card.checklist.length > 0 && (
          <span className={`num flex items-center gap-1 ${doneItems === card.checklist.length ? "text-ok" : ""}`}>
            <Icon name="checklist" size={14} />
            {doneItems}/{card.checklist.length}
          </span>
        )}
        {card.description && (
          <span className="flex items-center" title="Has notes">
            <Icon name="text" size={14} />
            <span className="sr-only">Has notes</span>
          </span>
        )}
        <span className="ml-auto">
          <AvatarStack ids={card.assignees} size={22} />
        </span>
      </div>
    </div>
  );
}

function SortableCard({ card, disabled, finished, onOpen }: { card: Card; disabled: boolean; finished: boolean; onOpen: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id, disabled });
  const style = { transform: CSS.Translate.toString(transform), transition };
  type Handler = (event: unknown) => void;
  const on = (name: string) => listeners?.[name] as Handler | undefined;
  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`group relative ${isDragging ? "opacity-40" : ""}`}
      onMouseDown={on("onMouseDown")}
      onTouchStart={on("onTouchStart")}
    >
      <button
        type="button"
        onClick={onOpen}
        className="block w-full rounded-xl transition-transform duration-150 ease-[var(--ease-out)] active:scale-[0.99]"
        aria-label={`${card.title}. Open details`}
      >
        <CardFace card={card} finished={finished} />
      </button>
      {!disabled && (
        <button
          type="button"
          {...attributes}
          onKeyDown={on("onKeyDown")}
          aria-label={`Move ${card.title}`}
          className="absolute right-1.5 top-1.5 grid size-7 place-items-center rounded-md text-muted opacity-0 transition-opacity duration-150 hover:bg-raised hover:text-fg focus-visible:opacity-100 group-hover:opacity-100"
        >
          <Icon name="grip" />
        </button>
      )}
    </li>
  );
}

function AddCard({ onAdd }: { onAdd: (title: string) => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title.trim());
    setTitle("");
  };
  if (!open)
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-9 w-full items-center gap-2 rounded-lg px-2.5 text-fg-2 transition-colors duration-150 hover:bg-card hover:text-fg"
      >
        <Icon name="plus" />
        Add card
      </button>
    );
  return (
    <form onSubmit={submit} className="grid gap-2">
      <label className="sr-only" htmlFor="new-card">
        Card title
      </label>
      <textarea
        id="new-card"
        autoFocus
        rows={2}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) submit(e);
          if (e.key === "Escape") setOpen(false);
        }}
        placeholder="What needs doing"
        className="resize-none rounded-xl border border-line-strong bg-card px-3 py-2.5 placeholder:text-muted"
      />
      <div className="flex gap-2">
        <button type="submit" className="h-8 rounded-lg bg-fg px-3 font-medium text-page transition-colors duration-150 hover:bg-fg/85">
          Add card
        </button>
        <button type="button" onClick={() => setOpen(false)} className="h-8 rounded-lg px-3 text-fg-2 transition-colors duration-150 hover:bg-card">
          Done
        </button>
      </div>
    </form>
  );
}

function ColumnHeader({ boardId, column, count }: { boardId: string; column: Column; count: number }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(column.title);
  const save = () => {
    if (title.trim()) actions.renameColumn(boardId, column.id, title.trim());
    else setTitle(column.title);
    setEditing(false);
  };
  return (
    <div className="flex h-10 items-center gap-2 px-1.5">
      {editing ? (
        <input
          autoFocus
          aria-label="Column name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") {
              setTitle(column.title);
              setEditing(false);
            }
          }}
          className="h-8 min-w-0 flex-1 rounded-md border border-line-strong bg-card px-2 font-medium"
        />
      ) : (
        <h2 className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="max-w-full truncate rounded-md px-1 py-0.5 text-left font-medium transition-colors duration-150 hover:bg-card"
            title="Rename column"
          >
            {column.title}
          </button>
        </h2>
      )}
      <span className="num text-[13px] text-muted">{count}</span>
      {column.cardIds.length === 0 && !editing && (
        <button
          type="button"
          onClick={() => actions.deleteColumn(boardId, column.id)}
          aria-label={`Delete empty column ${column.title}`}
          className="grid size-7 place-items-center rounded-md text-muted transition-colors duration-150 hover:bg-card hover:text-fg"
        >
          <Icon name="trash" size={14} />
        </button>
      )}
    </div>
  );
}

function Lane({
  board,
  column,
  cards,
  dragDisabled,
  finished,
  onOpen,
}: {
  board: BoardT;
  column: Column;
  cards: Card[];
  dragDisabled: boolean;
  finished: boolean;
  onOpen: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  return (
    <section
      aria-label={column.title}
      className="flex w-[84vw] max-w-[300px] shrink-0 snap-start flex-col rounded-2xl bg-lane p-2 sm:w-[288px]"
    >
      <ColumnHeader boardId={board.id} column={column} count={cards.length} />
      <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <ol ref={setNodeRef} className={`mt-1 grid min-h-16 content-start gap-2 rounded-xl transition-colors duration-150 ${isOver ? "bg-raised" : ""}`}>
          {cards.map((card) => (
            <SortableCard key={card.id} card={card} disabled={dragDisabled} finished={finished} onOpen={() => onOpen(card.id)} />
          ))}
          {cards.length === 0 && (
            <li className="grid h-16 place-items-center rounded-xl border border-dashed border-line-strong text-[13px] text-muted">
              {dragDisabled ? "No matching cards" : "Drop cards here"}
            </li>
          )}
        </ol>
      </SortableContext>
      <div className="mt-2">
        <AddCard onAdd={(title) => actions.addCard(board.id, column.id, title)} />
      </div>
    </section>
  );
}

function AddColumn({ boardId }: { boardId: string }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    actions.addColumn(boardId, title.trim());
    setTitle("");
    setOpen(false);
  };
  return (
    <div className="w-[84vw] max-w-[300px] shrink-0 sm:w-[288px]">
      {open ? (
        <form onSubmit={submit} className="grid gap-2 rounded-2xl bg-lane p-3">
          <label className="text-[13px] text-fg-2" htmlFor="new-column">
            Column name
          </label>
          <input
            id="new-column"
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
            placeholder="Blocked"
            className="h-9 rounded-lg border border-line-strong bg-card px-3 placeholder:text-muted"
          />
          <div className="flex gap-2">
            <button type="submit" className="h-8 rounded-lg bg-fg px-3 font-medium text-page">
              Add column
            </button>
            <button type="button" onClick={() => setOpen(false)} className="h-8 rounded-lg px-3 text-fg-2 hover:bg-card">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-12 w-full items-center gap-2 rounded-2xl border border-dashed border-line-strong px-4 text-fg-2 transition-colors duration-150 hover:bg-lane hover:text-fg"
        >
          <Icon name="plus" />
          Add column
        </button>
      )}
    </div>
  );
}

function Toggle({ pressed, onClick, children, label }: { pressed: boolean; onClick: () => void; children: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-label={label}
      onClick={onClick}
      className={`flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[13px] transition-colors duration-150 ${
        pressed ? "border-line-strong bg-card text-fg shadow-[var(--shadow)]" : "border-transparent text-fg-2 hover:bg-lane hover:text-fg"
      }`}
    >
      {children}
    </button>
  );
}

export function Board() {
  const { boardId } = useParams();
  const board = useBoard(boardId);
  useTitle(board?.name ?? "Board not found");
  const [params, setParams] = useSearchParams();
  const openId = params.get("card");

  const [query, setQuery] = useState("");
  const [labelFilter, setLabelFilter] = useState<string[]>([]);
  const [memberFilter, setMemberFilter] = useState<string[]>([]);
  const filtering = query.trim() !== "" || labelFilter.length > 0 || memberFilter.length > 0;

  const [columns, setColumns] = useState<Column[]>(board?.columns ?? []);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  useEffect(() => {
    if (board && activeId === null) setColumns(board.columns);
  }, [board, activeId]);

  // Left and right arrows jump to the next column; up and down move within a column.
  const columnsRef = useRef(columns);
  columnsRef.current = columns;
  const coordinateGetter: KeyboardCoordinateGetter = (event, args) => {
    const { active, collisionRect, droppableContainers } = args.context;
    if (active && collisionRect && (event.code === "ArrowRight" || event.code === "ArrowLeft")) {
      const cols = columnsRef.current;
      const from = cols.findIndex((c) => c.cardIds.includes(String(active.id)));
      const to = from + (event.code === "ArrowRight" ? 1 : -1);
      const rect = cols[to] && droppableContainers.get(cols[to].id)?.rect.current;
      event.preventDefault();
      if (!rect) return args.currentCoordinates;
      return { x: rect.left, y: rect.top + 4 };
    }
    return sortableKeyboardCoordinates(event, args);
  };
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter }),
  );

  // Suppress the click that follows a mouse drag, so dropping a card doesn't open it.
  const justDragged = useRef(false);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (card: Card) =>
      (!q || card.title.toLowerCase().includes(q) || card.description.toLowerCase().includes(q)) &&
      (labelFilter.length === 0 || labelFilter.some((l) => card.labels.includes(l))) &&
      (memberFilter.length === 0 || memberFilter.some((m) => card.assignees.includes(m)));
  }, [query, labelFilter, memberFilter]);

  if (!board) return <NotFound />;

  const columnOf = (id: UniqueIdentifier) =>
    columns.find((c) => c.id === id) ?? columns.find((c) => c.cardIds.includes(String(id)));

  const onDragStart = ({ active }: DragStartEvent) => setActiveId(active.id);

  const onDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return;
    const from = columnOf(active.id);
    const to = columnOf(over.id);
    if (!from || !to || from.id === to.id) return;
    setColumns((cols) =>
      cols.map((c) => {
        if (c.id === from.id) return { ...c, cardIds: c.cardIds.filter((id) => id !== active.id) };
        if (c.id === to.id) {
          const overIndex = c.cardIds.indexOf(String(over.id));
          const at = overIndex >= 0 ? overIndex : c.cardIds.length;
          const ids = [...c.cardIds];
          ids.splice(at, 0, String(active.id));
          return { ...c, cardIds: ids };
        }
        return c;
      }),
    );
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    let next = columns;
    if (over) {
      const col = columnOf(active.id);
      if (col && col.cardIds.includes(String(over.id))) {
        const from = col.cardIds.indexOf(String(active.id));
        const to = col.cardIds.indexOf(String(over.id));
        if (from !== to) next = columns.map((c) => (c.id === col.id ? { ...c, cardIds: arrayMove(c.cardIds, from, to) } : c));
      }
    }
    setColumns(next);
    actions.setColumns(board.id, next);
    setActiveId(null);
    justDragged.current = true;
    window.setTimeout(() => (justDragged.current = false), 120);
  };

  const onDragCancel = () => {
    setColumns(board.columns);
    setActiveId(null);
  };

  const titleOf = (id: UniqueIdentifier) => board.cards[String(id)]?.title ?? "card";
  const placeOf = (id: UniqueIdentifier) => {
    const col = columnOf(id);
    if (!col) return "";
    const index = col.cardIds.indexOf(String(id));
    return index >= 0 ? `${col.title}, position ${index + 1} of ${col.cardIds.length}` : col.title;
  };
  const announcements: Announcements = {
    onDragStart: ({ active }) => `Picked up ${titleOf(active.id)}. ${placeOf(active.id)}. Use the arrow keys to move, space to drop, escape to cancel.`,
    onDragOver: ({ active, over }) => (over ? `${titleOf(active.id)} is now in ${placeOf(active.id)}.` : `${titleOf(active.id)} is outside the board.`),
    onDragEnd: ({ active, over }) => (over ? `Dropped ${titleOf(active.id)} in ${placeOf(active.id)}.` : `${titleOf(active.id)} was dropped back where it started.`),
    onDragCancel: ({ active }) => `Moving cancelled. ${titleOf(active.id)} went back to where it started.`,
  };

  const open = (id: string) => {
    if (justDragged.current) return;
    setParams({ card: id });
  };
  const close = () => setParams({});

  const totalCards = Object.keys(board.cards).length;
  const activeCard = activeId ? board.cards[String(activeId)] : null;
  const toggle = (list: string[], set: (v: string[]) => void, id: string) =>
    set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="px-4 pb-4 pt-6 sm:px-6">
        <Link to="/" className="inline-flex items-center gap-1 rounded-md text-[13px] text-fg-2 transition-colors duration-150 hover:text-fg">
          <Icon name="back" size={14} />
          Projects
        </Link>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div className="min-w-0">
            <h1 className="text-[28px] font-medium leading-tight tracking-[-0.01em]">{board.name}</h1>
            <p className="mt-1 text-fg-2">
              {board.client}
              <span className="num text-muted">
                {" "}
                &middot; {totalCards} cards
              </span>
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
          <label className="relative block w-full sm:w-64">
            <span className="sr-only">Search cards</span>
            <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="h-9 w-full rounded-lg border border-line bg-card pl-9 pr-3 placeholder:text-muted"
            />
          </label>
          <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Filter by label">
            {labels.map((l) => (
              <Toggle key={l.id} pressed={labelFilter.includes(l.id)} onClick={() => toggle(labelFilter, setLabelFilter, l.id)} label={`Label ${l.name}`}>
                <span className="h-1.5 w-4 rounded-full" style={{ background: l.color }} />
                {l.name}
              </Toggle>
            ))}
          </div>
          <div className="flex items-center gap-1" role="group" aria-label="Filter by person">
            {members.map((m) => (
              <button
                key={m.id}
                type="button"
                aria-pressed={memberFilter.includes(m.id)}
                aria-label={`Assigned to ${m.name}`}
                onClick={() => toggle(memberFilter, setMemberFilter, m.id)}
                className={`rounded-full p-0.5 transition-colors duration-150 ${memberFilter.includes(m.id) ? "bg-fg" : "hover:bg-line-strong"}`}
              >
                <Avatar id={m.id} size={26} ring={false} />
              </button>
            ))}
          </div>
          {filtering && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setLabelFilter([]);
                setMemberFilter([]);
              }}
              className="h-8 rounded-lg px-2.5 text-[13px] text-fg-2 underline decoration-line-strong underline-offset-4 hover:text-fg"
            >
              Clear filters
            </button>
          )}
        </div>
        {filtering && <p className="mt-2 text-[13px] text-muted">Dragging is paused while filters are on. Open a card to move it.</p>}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
        accessibility={{
          announcements,
          screenReaderInstructions: {
            draggable: "To move a card, press space on its move button. Use the arrow keys to move it between columns and positions, space to drop, escape to cancel.",
          },
        }}
      >
        <div className="scroll-x flex flex-1 snap-x snap-mandatory items-start gap-3 overflow-x-auto px-4 pb-8 sm:snap-none sm:px-6">
          {columns.map((col, i) => (
            <Lane
              key={col.id}
              board={board}
              column={col}
              cards={col.cardIds.map((id) => board.cards[id]).filter((c): c is Card => Boolean(c) && matches(c))}
              dragDisabled={filtering}
              finished={i === columns.length - 1}
              onOpen={open}
            />
          ))}
          <AddColumn boardId={board.id} />
        </div>
        <DragOverlay dropAnimation={{ duration: 200, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }}>
          {activeCard ? (
            <div className="w-[84vw] max-w-[284px] rotate-[1.5deg] sm:w-[272px]">
              <CardFace card={activeCard} dragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {openId && board.cards[openId] && <CardDrawer board={board} cardId={openId} onClose={close} />}
    </div>
  );
}
