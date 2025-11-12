"use client";

import { useState, useEffect, useRef } from "react";
import { formatSecondsWithDecimal, formatSeconds } from "@/lib/utils";

export interface Attempt {
  value: number;
  bonus: number;
  total: number;
  timestamp: number;
}

interface TimeTrainingScreenProps {
  target: number;
  bonus: number;
  totalAccumulated: number;
  attempts: Attempt[];
  onBailOut: (currentValue: number) => void;
  onStop: (currentValue: number) => void;
  onReset: () => void;
}

export default function TimeTrainingScreen({
  target,
  bonus,
  totalAccumulated,
  attempts,
  onBailOut,
  onStop,
  onReset,
}: TimeTrainingScreenProps) {
  const [currentValue, setCurrentValue] = useState(0);
  const [canBail, setCanBail] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    // Start timer immediately
    startTimeRef.current = Date.now();

    // Update timer every 100ms for smooth display
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      setCurrentValue(elapsed);
    }, 100);

    // Enable bail after 1 second to prevent accidents
    const bailTimer = setTimeout(() => {
      setCanBail(true);
    }, 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(bailTimer);
    };
  }, []);

  const handleBailOut = () => {
    if (!canBail) return;
    onBailOut(currentValue);
  };

  const handleStop = () => {
    if (!canBail) return;
    onStop(currentValue);
  };

  // Calculate live progress including current timer
  const currentCounted = Math.max(0, currentValue - bonus);
  const liveTotal = totalAccumulated + currentCounted;
  const remaining = Math.max(0, target - liveTotal);
  const progressPercent = Math.min(100, (liveTotal / target) * 100);
  const targetReached = liveTotal >= target;

  return (
    <div className="h-screen bg-green-500 flex flex-col p-6">
      {/* Attempt Counter and Reset Button */}
      <div className="flex justify-between items-center mb-4 mt-4">
        <div className="text-white text-xl font-semibold">
          Attempt #{attempts.length + 1}
        </div>
        <button
          onClick={onReset}
          className="text-white/70 hover:text-white text-sm font-medium px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Main Timer Display */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-8xl font-bold mb-4 tabular-nums no-select">
            {formatSecondsWithDecimal(currentValue)}
          </div>
          <div className="text-white/80 text-2xl font-medium">
            Hold Time
          </div>
        </div>
      </div>

      {/* Progress Section - Larger */}
      <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 mb-4">
        <div className="flex justify-between text-white text-2xl font-bold mb-4">
          <span>{formatSecondsWithDecimal(liveTotal)}</span>
          <span className="text-white/60">/</span>
          <span>{formatSeconds(target)}</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-5 mb-4 overflow-hidden">
          <div
            className="bg-white h-full rounded-full transition-all duration-100"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="text-white text-xl text-center font-semibold">
          {formatSecondsWithDecimal(remaining)} remaining
        </div>
      </div>

      {/* Action Buttons */}
      {targetReached ? (
        // Only show Stop button when target is reached
        <button
          onClick={handleStop}
          disabled={!canBail}
          className={`w-full text-white font-bold text-3xl py-8 rounded-2xl shadow-2xl transition-all ${
            canBail
              ? "bg-red-500 hover:bg-red-600 active:scale-95"
              : "bg-gray-600 opacity-50 cursor-not-allowed"
          }`}
        >
          {canBail ? "Stop" : "Get Ready..."}
        </button>
      ) : (
        // Show both Bail Out and Stop buttons when target not reached
        <div className="flex gap-4">
          <button
            onClick={handleBailOut}
            disabled={!canBail}
            className={`flex-1 text-white font-bold text-3xl py-8 rounded-2xl shadow-2xl transition-all ${
              canBail
                ? "bg-orange-500 hover:bg-orange-600 active:scale-95"
                : "bg-gray-600 opacity-50 cursor-not-allowed"
            }`}
          >
            {canBail ? "Bail Out" : "Get Ready..."}
          </button>
          <button
            onClick={handleStop}
            disabled={!canBail}
            className={`flex-1 text-white font-bold text-3xl py-8 rounded-2xl shadow-2xl transition-all ${
              canBail
                ? "bg-red-500 hover:bg-red-600 active:scale-95"
                : "bg-gray-600 opacity-50 cursor-not-allowed"
            }`}
          >
            {canBail ? "Stop" : "Get Ready..."}
          </button>
        </div>
      )}
    </div>
  );
}
