import type { ReactNode } from "react";
import { createRootRoute, HeadContent, Link, Scripts } from "@tanstack/react-router";
import stylesCss from "@/styles.css?url";
import rootCss from "./__root.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      { title: "Flair" },
    ],
    links: [
      { rel: "stylesheet", href: stylesCss },
      { rel: "stylesheet", href: rootCss },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <nav className="navbar">
          <div className="navbar-inner">
            <Link to="/" className="navbar-brand">
              Flair
            </Link>
          </div>
        </nav>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
