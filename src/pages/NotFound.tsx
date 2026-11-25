import { Link } from "react-router";
import { useTitle } from "../lib/useTitle";

export function NotFound() {
  useTitle("Not found");
  return (
    <div className="mx-auto grid max-w-md flex-1 place-content-center px-6 py-24 text-center">
      <p className="num text-[13px] text-muted">404</p>
      <h1 className="mt-2 text-[28px] font-medium leading-tight">This board isn't here</h1>
      <p className="mt-2 text-fg-2">It may have been deleted, or the link is from another browser. Boards are saved on the device you made them on.</p>
      <Link to="/" className="mx-auto mt-6 inline-flex h-10 items-center rounded-lg bg-fg px-4 font-medium text-page">
        Back to projects
      </Link>
    </div>
  );
}
