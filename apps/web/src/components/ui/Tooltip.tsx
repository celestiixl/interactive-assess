"use client";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Placement = "top" | "bottom" | "left" | "right";

export default function Tooltip({
  content,
  children,
  placement = "top",
  showDelay = 120,
  hideDelay = 100,
  maxWidth = 320,
}: {
  content: React.ReactNode;
  children: React.ReactNode;
  placement?: Placement;
  showDelay?: number;
  hideDelay?: number;
  maxWidth?: number;
}) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    placement: Placement;
  }>({ top: 0, left: 0, placement });
  const showTimer = useRef<any>(null);
  const hideTimer = useRef<any>(null);
  const idRef = useRef(`tt_${Math.random().toString(36).slice(2)}`);
  const isTouch = typeof window !== "undefined" && "ontouchstart" in window;

  // One-at-a-time manager
  useEffect(() => {
    const onOpen = (e: any) => {
      if (e.detail !== idRef.current) setVisible(false);
    };
    window.addEventListener("tooltip:open", onOpen as any);
    return () => window.removeEventListener("tooltip:open", onOpen as any);
  }, []);

  function open() {
    if (isTouch) return; // skip on touch
    clearTimeout(hideTimer.current);
    showTimer.current = setTimeout(() => {
      position();
      window.dispatchEvent(
        new CustomEvent("tooltip:open", { detail: idRef.current }),
      );
      setVisible(true);
    }, showDelay);
  }

  function close() {
    clearTimeout(showTimer.current);
    hideTimer.current = setTimeout(() => setVisible(false), hideDelay);
  }

  function position() {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const margin = 10;
    const bodyW = window.innerWidth;
    const bodyH = window.innerHeight;

    // default requested placement
    let p: Placement = placement;
    let top = 0,
      left = 0;

    const estimate = (pl: Placement) => {
      if (pl === "top") {
        top = r.top - margin;
        left = r.left + r.width / 2;
      }
      if (pl === "bottom") {
        top = r.bottom + margin;
        left = r.left + r.width / 2;
      }
      if (pl === "left") {
        top = r.top + r.height / 2;
        left = r.left - margin;
      }
      if (pl === "right") {
        top = r.top + r.height / 2;
        left = r.right + margin;
      }
    };

    // try requested, then flip if we'd be off-screen vertically/horizontally
    estimate(p);
    const offTop = top < 0,
      offBottom = top > bodyH,
      offLeft = left < 0,
      offRight = left > bodyW;
    if ((p === "top" && offTop) || (p === "bottom" && offBottom))
      p = p === "top" ? "bottom" : "top";
    if ((p === "left" && offLeft) || (p === "right" && offRight))
      p = p === "left" ? "right" : "left";
    estimate(p);

    // store; actual bubble will center itself with CSS transform
    setCoords({ top, left, placement: p });
  }

  useLayoutEffect(() => {
    if (!visible) return;
    position();
    const onScroll = () => position();
    const onResize = () => position();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [visible]);

  return (
    <>
      <span
        ref={triggerRef}
        className="inline-flex focus:outline-none focus-visible:ring-brand ring-brand"
        onMouseEnter={open}
        onMouseLeave={close}
        onFocus={open}
        onBlur={close}
      >
        {children}
      </span>
      {visible &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="pointer-events-none fixed z-[9999]"
            style={{
              top: coords.top,
              left: coords.left,
              transform:
                coords.placement === "top" || coords.placement === "bottom"
                  ? "translate(-50%, 0)"
                  : "translate(0, -50%)",
            }}
          >
            <div className="tip-card" style={{ maxWidth }} data-show={true}>
              {content}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
