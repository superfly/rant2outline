import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";

import GraphicalEmoji from "@/lib/GraphicalEmoji";
import styles from "./xess.css?url";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <main>
          {children}
          <ScrollRestoration />
          <Scripts />
          <footer
            style={{
              margin: "2rem 0",
              textAlign: "center",
            }}
          >
            <p>
              Brought to you with{" "}
              <span style={{ fontSize: "1.5rem", verticalAlign: "middle" }}>
                <GraphicalEmoji emoji="❤️" />
              </span>{" "}
              by the nerds at <a href="https://fly.io">Fly.io</a> -{" "}
              <img
                style={{
                  height: "2rem",
                  verticalAlign: "middle",
                  marginBottom: "0.4rem",
                }}
                src="/img/brandmark-light.svg"
              />
              <GraphicalEmoji emoji="➕" />
              <a href="https://fly.io/hello/xe">
                <span id="sigil"></span>
              </a>
            </p>
          </footer>
        </main>
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
