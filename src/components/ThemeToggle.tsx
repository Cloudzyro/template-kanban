import { useState } from "react";
import { Icon } from "./Icon";

export function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      /* ignore */
    }
  };
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      className="grid size-8 place-items-center rounded-lg text-fg-2 transition-colors duration-150 hover:bg-raised hover:text-fg"
    >
      <Icon name={dark ? "sun" : "moon"} />
    </button>
  );
}
