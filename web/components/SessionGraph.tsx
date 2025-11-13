"use client";

import { useMemo } from "react";

interface DataPoint {
  sessionNumber: number;
  totalAccumulated: number;
  sessionDuration: number;
  bestHold: number;
}

interface SessionGraphProps {
  data: DataPoint[];
  mode: "time" | "reps";
}

export default function SessionGraph({ data, mode }: SessionGraphProps) {
  const chartData = useMemo(() => {
    if (data.length === 0) return null;

    // Reverse data so oldest is first (left to right on graph)
    const reversedData = [...data].reverse();

    // Calculate min/max for scaling
    const allValues = reversedData.flatMap(d => [
      d.totalAccumulated,
      d.sessionDuration,
      d.bestHold,
    ]);
    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);
    const valueRange = maxValue - minValue || 1;

    // SVG dimensions
    const width = 100; // percentage
    const height = 150; // pixels
    const padding = 10;

    // Scale function
    const scaleY = (value: number) => {
      const normalized = (value - minValue) / valueRange;
      return height - padding - (normalized * (height - 2 * padding));
    };

    const scaleX = (index: number) => {
      const pointSpacing = (width - 2 * padding) / Math.max(1, reversedData.length - 1);
      return padding + (index * pointSpacing);
    };

    // Generate path strings for each line
    const createPath = (values: number[]) => {
      return values
        .map((value, index) => {
          const x = scaleX(index);
          const y = scaleY(value);
          return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
        })
        .join(" ");
    };

    return {
      width,
      height,
      totalAccumulatedPath: createPath(reversedData.map(d => d.totalAccumulated)),
      sessionDurationPath: createPath(reversedData.map(d => d.sessionDuration)),
      bestHoldPath: createPath(reversedData.map(d => d.bestHold)),
    };
  }, [data]);

  if (!chartData || data.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-4">
        <p className="text-white/60 text-center">No data to display</p>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-4">
      <h2 className="text-white text-lg font-semibold mb-4">Progress Trends</h2>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-400" />
          <span className="text-white/80">Total {mode === "time" ? "Time" : "Reps"}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-400" />
          <span className="text-white/80">Duration</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-400" />
          <span className="text-white/80">Best {mode === "time" ? "Hold" : "Set"}</span>
        </div>
      </div>

      {/* Graph */}
      <div className="relative w-full" style={{ height: `${chartData.height}px` }}>
        <svg
          viewBox={`0 0 ${chartData.width} ${chartData.height}`}
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          {/* Grid lines */}
          <line
            x1="10" y1={chartData.height / 2} x2="90" y2={chartData.height / 2}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="0.5"
          />

          {/* Total Accumulated line */}
          <path
            d={chartData.totalAccumulatedPath}
            fill="none"
            stroke="#60a5fa"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />

          {/* Session Duration line */}
          <path
            d={chartData.sessionDurationPath}
            fill="none"
            stroke="#fb923c"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />

          {/* Best Hold line */}
          <path
            d={chartData.bestHoldPath}
            fill="none"
            stroke="#4ade80"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>

      <div className="mt-2 text-xs text-white/50 text-center">
        Showing last {data.length} session{data.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
