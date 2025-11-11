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
}

export default function TimeTrainingScreen({
  target,
  bonus,
  totalAccumulated,
  attempts,
  onBailOut,
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

  const remaining = Math.max(0, target - totalAccumulated);
  const progressPercent = Math.min(100, (totalAccumulated / target) * 100);

  return (
    <div className="h-screen bg-green-500 flex flex-col p-6">
      {/* Attempt Counter */}
      <div className="text-center text-white text-xl font-semibold mb-4 mt-6">
        Attempt #{attempts.length + 1}
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

      {/* Progress Section */}
      <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 mb-6">
        <div className="flex justify-between text-white text-lg mb-3">
          <span>Accumulated: {formatSeconds(totalAccumulated)}</span>
          <span>Target: {formatSeconds(target)}</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-4 mb-3 overflow-hidden">
          <div
            className="bg-white h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="text-white text-base text-center">
          Remaining: {formatSeconds(remaining)}
        </div>
      </div>

      {/* Bail Out Button */}
      <button
        onClick={handleBailOut}
        disabled={!canBail}
        className={`w-full text-white font-bold text-3xl py-8 rounded-2xl shadow-2xl transition-all ${
          canBail
            ? "bg-orange-500 hover:bg-orange-600 active:scale-95"
            : "bg-gray-600 opacity-50 cursor-not-allowed"
        }`}
      >
        {canBail ? "Bail Out" : "Get Ready..."}
      </button>
    </div>
  );
}
