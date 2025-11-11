"use client";

import { useEffect } from "react";
import { formatSeconds, formatCountdown } from "@/lib/utils";
import type { TrainingMode } from "./SetupScreen";

interface RestScreenProps {
  mode: TrainingMode;
  restCountdown: number;
  target: number;
  totalAccumulated: number;
  onCountdownTick: () => void;
  onRestComplete: () => void;
}

export default function RestScreen({
  mode,
  restCountdown,
  target,
  totalAccumulated,
  onCountdownTick,
  onRestComplete,
}: RestScreenProps) {
  useEffect(() => {
    if (restCountdown > 0) {
      const timer = setTimeout(() => {
        onCountdownTick();
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Auto-transition when countdown reaches 0
      onRestComplete();
    }
  }, [restCountdown, onCountdownTick, onRestComplete]);

  const progressPercent = Math.min(100, (totalAccumulated / target) * 100);
  const remaining = Math.max(0, target - totalAccumulated);

  return (
    <div className="min-h-screen bg-orange-500 flex flex-col p-6">
      {/* REST Header */}
      <div className="text-center text-white text-4xl font-bold mb-8 mt-12">
        REST
      </div>

      {/* Countdown Timer */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-9xl font-bold mb-4 tabular-nums no-select">
            {formatCountdown(restCountdown)}
          </div>
          <div className="text-white/80 text-2xl font-medium">
            Next set starts in...
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 mb-6">
        <div className="flex justify-between text-white text-lg mb-3">
          <span>
            Accumulated:{" "}
            {mode === "time" ? formatSeconds(totalAccumulated) : `${totalAccumulated} reps`}
          </span>
          <span>
            Target: {mode === "time" ? formatSeconds(target) : `${target} reps`}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-4 mb-3 overflow-hidden">
          <div
            className="bg-white h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="text-white text-base text-center">
          Remaining:{" "}
          {mode === "time" ? formatSeconds(remaining) : `${remaining} reps`}
        </div>
      </div>
    </div>
  );
}
