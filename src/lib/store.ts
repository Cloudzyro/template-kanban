import { useSyncExternalStore } from "react";
import { boards as sampleBoards, type Board, type Card } from "../data/boards";

// Boards live in the browser's localStorage, so changes survive a refresh.
// Swap these functions for calls to your own API when you add a backend.

const KEY = "kanban-boards-v1";
type State = { boards: Board[] };

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as State;
      if (Array.isArray(parsed.boards)) return parsed;
    }
  } catch {
    /* storage blocked or corrupt: fall back to the sample data */
  }
  return { boards: clone(sampleBoards) };
}

let state: State = load();
const listeners = new Set<() => void>();

function set(next: State) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore: the board still works for this visit */
  }
  listeners.forEach((l) => l());
}

function updateBoard(boardId: string, fn: (b: Board) => Board) {
  set({ boards: state.boards.map((b) => (b.id === boardId ? fn(clone(b)) : b)) });
}

export function useBoards() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
  ).boards;
}

export function useBoard(id: string | undefined) {
  return useBoards().find((b) => b.id === id);
}

let counter = 0;
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}${(counter++).toString(36)}`;

export const actions = {
  reset() {
    set({ boards: clone(sampleBoards) });
  },

  addBoard(name: string, client: string) {
    const id = uid("board");
    const board: Board = {
      id,
      name,
      client,
      summary: "",
      columns: [
        { id: "todo", title: "To do", cardIds: [] },
        { id: "doing", title: "In progress", cardIds: [] },
        { id: "review", title: "With client", cardIds: [] },
        { id: "done", title: "Done", cardIds: [] },
      ],
      cards: {},
    };
    set({ boards: [...state.boards, board] });
    return id;
  },

  deleteBoard(boardId: string) {
    set({ boards: state.boards.filter((b) => b.id !== boardId) });
  },

  setColumns(boardId: string, columns: Board["columns"]) {
    updateBoard(boardId, (b) => ({ ...b, columns }));
  },

  moveCard(boardId: string, cardId: string, toColumnId: string, toIndex?: number) {
    updateBoard(boardId, (b) => {
      for (const col of b.columns) col.cardIds = col.cardIds.filter((id) => id !== cardId);
      const target = b.columns.find((col) => col.id === toColumnId);
      if (target) {
        const i = toIndex === undefined ? target.cardIds.length : Math.min(toIndex, target.cardIds.length);
        target.cardIds.splice(i, 0, cardId);
      }
      return b;
    });
  },

  addCard(boardId: string, columnId: string, title: string) {
    const id = uid("card");
    updateBoard(boardId, (b) => {
      b.cards[id] = { id, title, description: "", labels: [], assignees: [], due: null, checklist: [] };
      b.columns.find((col) => col.id === columnId)?.cardIds.push(id);
      return b;
    });
    return id;
  },

  updateCard(boardId: string, cardId: string, patch: Partial<Card>) {
    updateBoard(boardId, (b) => {
      const card = b.cards[cardId];
      if (card) b.cards[cardId] = { ...card, ...patch };
      return b;
    });
  },

  deleteCard(boardId: string, cardId: string) {
    updateBoard(boardId, (b) => {
      delete b.cards[cardId];
      for (const col of b.columns) col.cardIds = col.cardIds.filter((id) => id !== cardId);
      return b;
    });
  },

  addColumn(boardId: string, title: string) {
    updateBoard(boardId, (b) => {
      b.columns.push({ id: uid("col"), title, cardIds: [] });
      return b;
    });
  },

  renameColumn(boardId: string, columnId: string, title: string) {
    updateBoard(boardId, (b) => {
      const col = b.columns.find((x) => x.id === columnId);
      if (col) col.title = title;
      return b;
    });
  },

  deleteColumn(boardId: string, columnId: string) {
    updateBoard(boardId, (b) => {
      const col = b.columns.find((x) => x.id === columnId);
      if (!col || col.cardIds.length > 0) return b;
      b.columns = b.columns.filter((x) => x.id !== columnId);
      return b;
    });
  },
};

export { uid };
