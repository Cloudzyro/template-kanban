import { Link, Outlet, useParams } from "react-router";
import { members, workspace } from "../data/boards";
import { actions, useBoard } from "../lib/store";
import { AvatarStack } from "./Avatar";
import { Icon } from "./Icon";
import { LogoMark } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

export function Layout() {
  const { boardId } = useParams();
  const board = useBoard(boardId);

  const reset = () => {
    if (window.confirm("Reset every board to the sample data? Your changes in this browser will be lost.")) actions.reset();
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-fg focus:px-4 focus:py-2 focus:text-page"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-30 border-b border-line bg-page/95 backdrop-blur-sm">
        <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-2.5 rounded-lg py-1 pr-1">
            <LogoMark />
            <span className="truncate text-[15px] font-semibold">{workspace.name}</span>
          </Link>
          {board && (
            <>
              <span aria-hidden="true" className="hidden text-muted sm:inline">
                /
              </span>
              <span className="hidden min-w-0 truncate text-fg-2 sm:block">{board.name}</span>
            </>
          )}
          <div className="ml-auto flex items-center gap-1">
            <span className="mr-2 hidden md:block">
              <AvatarStack ids={members.map((m) => m.id)} size={26} max={5} />
            </span>
            <button
              type="button"
              onClick={reset}
              className="flex h-8 items-center gap-2 rounded-lg px-2.5 text-fg-2 transition-colors duration-150 hover:bg-raised hover:text-fg"
            >
              <Icon name="reset" />
              <span className="hidden sm:inline">Reset sample data</span>
              <span className="sr-only sm:hidden">Reset sample data</span>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main id="main" className="flex min-h-0 flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  );
}
