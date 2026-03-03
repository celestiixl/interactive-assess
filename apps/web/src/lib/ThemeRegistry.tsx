"use client";

import createCache from "@emotion/cache";
import { useServerInsertedHTML } from "next/navigation";
import { CacheProvider } from "@emotion/react";
import { CssVarsProvider } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";
import { useState } from "react";
import joyTheme from "./joyTheme";

/**
 * ThemeRegistry wires together:
 *  - Emotion's CacheProvider (so styles are collected server-side and injected
 *    into the HTML stream via useServerInsertedHTML, preventing FOUC in the
 *    Next.js App Router)
 *  - Joy UI's CssVarsProvider with the biospark custom theme
 *  - Joy UI's CssBaseline for consistent cross-browser baseline styles
 */
export default function ThemeRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  const [{ cache, flush }] = useState(() => {
    const cache = createCache({ key: "joy" });
    cache.compat = true;

    // Track which style names have been inserted so we can flush them for SSR.
    let inserted: string[] = [];
    const prevInsert = cache.insert.bind(cache);
    cache.insert = (...args) => {
      const serialized = args[1];
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }
      return prevInsert(...args);
    };

    const flush = () => {
      const prev = inserted;
      inserted = [];
      return prev;
    };

    return { cache, flush };
  });

  useServerInsertedHTML(() => {
    const names = flush();
    if (names.length === 0) return null;

    let styles = "";
    for (const name of names) {
      styles += cache.inserted[name];
    }

    return (
      <style
        key={cache.key}
        data-emotion={`${cache.key} ${names.join(" ")}`}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Emotion SSR pattern
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return (
    <CacheProvider value={cache}>
      <CssVarsProvider theme={joyTheme} defaultMode="light">
        <CssBaseline />
        {children}
      </CssVarsProvider>
    </CacheProvider>
  );
}
