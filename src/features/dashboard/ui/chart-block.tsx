"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type ChartBlockProps = {
  title: string;
  caption: string;
  legend?: ReactNode;
  children: (width: number) => ReactNode;
};

export function ChartBlock({ title, caption, legend, children }: ChartBlockProps) {
  const frame = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);

  useEffect(() => {
    const node = frame.current;
    if (!node) return;
    const measure = () => {
      if (node.clientWidth > 0) setWidth(node.clientWidth);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="rounded-(--radius-sheet) border border-line bg-sheet p-4">
      <h2>{title}</h2>
      <p className="mt-1 text-xs text-ink-secondary">{caption}</p>
      {legend ? <div className="mt-3">{legend}</div> : null}
      <div className="mt-4 max-h-90 overflow-auto" ref={frame}>
        {children(width)}
      </div>
    </section>
  );
}

export const chartTooltipStyle = {
  background: "#fffcf7",
  border: "1px solid #E4DDD2",
  borderRadius: 4,
  fontSize: 12,
};
