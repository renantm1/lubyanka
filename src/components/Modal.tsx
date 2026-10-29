"use client";
import { useEffect, useRef } from "react";
export default function Modal({
  title,
  close,
  children,
  wide = false,
}: {
  title: string;
  close: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const root = ref.current;
    const backdrop = root?.parentElement;
    const siblings = Array.from(backdrop?.parentElement?.children ?? []).filter(
      (e): e is HTMLElement =>
        e instanceof HTMLElement &&
        e !== backdrop &&
        !e.classList.contains("toast"),
    );
    const old = siblings.map((e) => e.inert);
    siblings.forEach((e) => {
      e.inert = true;
    });
    root?.focus();
    function key(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
      }
      if (e.key === "Tab") {
        const items = Array.from(
          root?.querySelectorAll<HTMLElement>(
            'button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),a[href],summary,[tabindex]:not([tabindex="-1"])',
          ) ?? [],
        ).filter((el) => {
          if (
            el.closest("[hidden],[inert]") ||
            el.getClientRects().length === 0
          )
            return false;
          let closed = el.closest("details:not([open])");
          while (closed) {
            const summary = Array.from(closed.children).find(
              (child) => child.tagName === "SUMMARY",
            );
            if (!summary?.contains(el)) return false;
            closed =
              closed.parentElement?.closest("details:not([open])") ?? null;
          }
          return true;
        });
        if (!items?.length) return;
        const first = items[0],
          last = items[items.length - 1];
        if (
          e.shiftKey &&
          (document.activeElement === first || document.activeElement === root)
        ) {
          e.preventDefault();
          last.focus();
        } else if (
          !e.shiftKey &&
          (document.activeElement === last || document.activeElement === root)
        ) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key);
      siblings.forEach((e, i) => {
        e.inert = old[i];
      });
      previous?.focus();
    };
  }, [close]);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    root.scrollTop = 0;
    root.focus({ preventScroll: true });
  }, [title]);
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`modal ${wide ? "wide" : ""}`}
      >
        <header className="modal-header">
          <span>{title}</span>
          <button onClick={close} aria-label="Fechar janela">
            ESC <b>×</b>
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}
