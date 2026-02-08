"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { ItemHotspot } from "@/types/item";

export default function Hotspot({
  item,
  onChecked,
  checkSignal,
}: {
  item: ItemHotspot;
  onChecked: (r: { score: number; max: number }) => void;
  checkSignal?: number;
}) {
  const [sel, setSel] = useState<string[]>([]);
  const imgRef = useRef<HTMLImageElement>(null);
  const [size, setSize] = useState<{ w: number; h: number }>({
    w: 640,
    h: 400,
  });

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    const r = () =>
      setSize({ w: el.clientWidth || 640, h: el.clientHeight || 400 });
    r();
    const obs = new ResizeObserver(r);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  function toggle(id: string) {
    setSel((prev) =>
      item.multi
        ? prev.includes(id)
          ? prev.filter((x) => x !== id)
          : [...prev, id]
        : [id],
    );
  }

  function scoreNow() {
    const setA = new Set(sel),
      setB = new Set(item.correct);
    const all = new Set([...setA, ...setB]).size;
    const intersection = [...setA].filter((x) => setB.has(x)).length;
    const correct =
      intersection === setB.size && setA.size === setB.size ? 1 : 0;
    onChecked({ score: correct, max: 1 });
  }

  useEffect(() => {
    if (checkSignal === undefined) return;
    scoreNow();
  }, [checkSignal]);

  useEffect(() => {
    if (typeof checkSignal === "number") scoreNow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkSignal]);

  // helpers to draw shapes
  const toPoints = (arr: number[]) =>
    arr.reduce(
      (acc, _, i) =>
        i % 2 ? acc + "," + arr[i] : acc + (i ? " " + arr[i] : ""),
      "",
    );
  const stroke = "#10b981";

  return (
    <div className="space-y-3">
      <div className="text-lg font-semibold">{item.stem}</div>

      <div className="relative w-full max-w-[720px]">
        {/* plain img to measure, SVG overlay for regions */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={item.image}
          alt={item.media?.alt ?? "diagram"}
          className="w-full rounded border"
        />
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {item.regions.map((r) => {
            const active = sel.includes(r.id);
            const common = {
              stroke: active ? stroke : "#111",
              fill: active ? "rgba(16,185,129,0.22)" : "rgba(0,0,0,0.08)",
              strokeWidth: 2,
            };
            if (r.shape === "rect") {
              const [x, y, w, h] = r.coords;
              return (
                <rect key={r.id} x={x} y={y} width={w} height={h} {...common} />
              );
            }
            if (r.shape === "circle") {
              const [cx, cy, rr] = r.coords;
              return <circle key={r.id} cx={cx} cy={cy} r={rr} {...common} />;
            }
            return (
              <polygon key={r.id} points={toPoints(r.coords)} {...common} />
            );
          })}
        </svg>
        {/* hit targets */}
        <div className="absolute inset-0">
          <svg className="w-full h-full">
            {item.regions.map((r) => {
              const on = () => toggle(r.id);
              if (r.shape === "rect") {
                const [x, y, w, h] = r.coords;
                return (
                  <rect
                    key={r.id}
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    fill="transparent"
                    onClick={on}
                    className="cursor-pointer"
                  />
                );
              }
              if (r.shape === "circle") {
                const [cx, cy, rr] = r.coords;
                return (
                  <circle
                    key={r.id}
                    cx={cx}
                    cy={cy}
                    r={rr}
                    fill="transparent"
                    onClick={on}
                    className="cursor-pointer"
                  />
                );
              }
              return (
                <polygon
                  key={r.id}
                  points={toPoints(r.coords)}
                  fill="transparent"
                  onClick={on}
                  className="cursor-pointer"
                />
              );
            })}
          </svg>
        </div>
      </div>

      <div className="flex gap-2">
        <button data-check-button="true" onClick={scoreNow} className="hidden">Check</button>
        {item.rationale && (
          <div className="text-sm text-neutral-700">Hint: {item.rationale}</div>
        )}
      </div>
    </div>
  );
}
