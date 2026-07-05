"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface SearchResult {
  id: string;
  type: string;
  typeLabel: string;
  title: string;
  href: string;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const requestId = useRef(0);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setResults([]);
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const isModK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      if (isModK) {
        e.preventDefault();
        setOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        close();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [close]);

  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    const currentRequest = ++requestId.current;
    setLoading(true);
    const timeout = setTimeout(() => {
      fetch(`/api/command-center/search?q=${encodeURIComponent(query.trim())}`)
        .then((res) => res.json())
        .then((data: { results: SearchResult[] }) => {
          if (requestId.current === currentRequest) {
            setResults(data.results ?? []);
            setLoading(false);
          }
        })
        .catch(() => {
          if (requestId.current === currentRequest) setLoading(false);
        });
    }, 200);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <>
      <button type="button" className="cc-search-trigger" onClick={() => setOpen(true)}>
        <span>Search…</span>
        <kbd>⌘K</kbd>
      </button>

      {open && (
        <div className="cc-palette-overlay" onClick={close}>
          <div className="cc-palette" onClick={(e) => e.stopPropagation()}>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search services, portfolio, blog posts, locations, testimonials, FAQs…"
              aria-label="Search the Command Center"
            />
            <div className="cc-palette-results">
              {loading && <p className="cc-palette-empty">Searching…</p>}
              {!loading && query.trim().length >= 2 && results.length === 0 && (
                <p className="cc-palette-empty">No matches for &ldquo;{query}&rdquo;.</p>
              )}
              {!loading && query.trim().length < 2 && (
                <p className="cc-palette-empty">Type at least 2 characters to search.</p>
              )}
              {results.map((r) => (
                <a key={`${r.type}-${r.id}`} href={r.href} className="cc-palette-item" onClick={close}>
                  {r.title}
                  <span className="cc-palette-item__type">{r.typeLabel}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
