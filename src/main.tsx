import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router";
import { Layout } from "./components/Layout";
import "./index.css";
import { Board } from "./pages/Board";
import { NotFound } from "./pages/NotFound";
import { Projects } from "./pages/Projects";

// A hash router keeps every address after a "#" (for example /#/board/riverside-library),
// so the server only ever sends index.html. Deep links work on any static host.
const router = createHashRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Projects /> },
      { path: "/board/:boardId", element: <Board /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
