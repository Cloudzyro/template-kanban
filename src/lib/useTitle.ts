import { useEffect } from "react";
import { site } from "../data/boards";

export function useTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${site.title}` : site.title;
  }, [title]);
}
