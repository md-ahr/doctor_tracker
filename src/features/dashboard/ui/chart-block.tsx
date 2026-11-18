"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type ChartBlockProps = {
  title: string;
  caption: string;
  legend?: ReactNode;
  actions?: ReactNode;
  children: (width: number) => ReactNode;
};

export function ChartBlock({ title, caption, legend, actions, children }: ChartBlockProps) {
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
    <section className="portal-card">
      <div className="card-heading">
        <div>
          <h2>{title}</h2>
          <p>{caption}</p>
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
      {legend ? <div className="mt-3">{legend}</div> : null}
      <div className="chart-frame" ref={frame}>
        {children(width)}
      </div>
    </section>
  );
}

export const chartTooltipStyle = {
  background: "#ffffff",
  border: "1px solid #e9eef6",
  borderRadius: 12,
  boxShadow: "0 18px 40px -24px rgba(15, 23, 42, 0.35)",
  fontSize: 11,
  padding: "8px 10px",
};

export const chartAxisTick = {
  fill: "#94a3b8",
  fontSize: 10.5,
  fontWeight: 600,
};
