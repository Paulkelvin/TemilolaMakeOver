"use client";

import { useEffect } from "react";

export function ScrollToHash() {
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const id = hash.slice(1);

    let attempts = 0;
    function tryScroll() {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      if (++attempts < 10) setTimeout(tryScroll, 150);
    }

    const t = setTimeout(tryScroll, 200);
    return () => clearTimeout(t);
  }, []);

  return null;
}
