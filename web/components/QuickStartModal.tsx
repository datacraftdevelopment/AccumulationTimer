"use client";

import { useState } from "react";
import { X, Play, Clock, Target, Timer } from "lucide-react";
import type { TrainingMode } from "./SetupScreen";

interface QuickStartModalProps {
  onClose: () => void;
  onStart: (config: {
    mode: TrainingMode;
    target: number;
    restTime: number;
    bonus: number;
    exerciseName: string;
  }) => void;
}

export default function QuickStartModal({ onClose, onStart }: QuickStartModalProps) {
  const [mode, setMode] = useState<TrainingMode>("time");
  const [target, setTarget] = useState(60);
  const [restTime, setRestTime] = useState(15);
  const [bonus, setBonus] = useState(5);

  function handleStart() {
    if (target <= 0) {
      alert("Target must be greater than 0");
      return;
    }
    if (restTime < 0) {
      alert("Rest time cannot be negative");
      return;
    }
    if (mode === "time" && bonus < 0) {
      alert("Adjustment cannot be negative");
      return;
    }

    onStart({
      mode,
      target,
      restTime,
      bonus: mode === "reps" ? 0 : bonus, // Always 0 for reps mode
      exerciseName: "Quick Session", // Special name to skip saving
    });
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50">
      <div className="bg-gray-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">Quick Start</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={28} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <p className="text-gray-400 text-sm">
            Run a training session without saving to history
          </p>

          {/* Mode Selection */}
          <div>
            <label className="block text-white font-medium mb-3">Mode</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMode("time")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  mode === "time"
                    ? "border-green-500 bg-green-500/20 text-white"
                    : "border-gray-600 bg-gray-700/50 text-gray-400"
                }`}
              >
                <Clock size={24} className="mx-auto mb-2" />
                <span className="font-medium">Time</span>
              </button>
              <button
                onClick={() => setMode("reps")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  mode === "reps"
                    ? "border-blue-500 bg-blue-500/20 text-white"
                    : "border-gray-600 bg-gray-700/50 text-gray-400"
                }`}
              >
                <Target size={24} className="mx-auto mb-2" />
                <span className="font-medium">Reps</span>
              </button>
            </div>
          </div>

          {/* Target */}
          <div>
            <label className="block text-white font-medium mb-2">
              Target {mode === "time" ? "(seconds)" : "(reps)"}
            </label>
            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
              className="w-full bg-gray-700 text-white text-lg px-4 py-3 rounded-xl border-2 border-gray-600 focus:border-blue-500 focus:outline-none"
              min="1"
            />
          </div>

          {/* Rest Time */}
          <div>
            <label className="block text-white font-medium mb-2">
              Rest Time (seconds)
            </label>
            <input
              type="number"
              value={restTime}
              onChange={(e) => setRestTime(Number(e.target.value))}
              className="w-full bg-gray-700 text-white text-lg px-4 py-3 rounded-xl border-2 border-gray-600 focus:border-blue-500 focus:outline-none"
              min="0"
            />
          </div>

          {/* Adjustment - Only show for time mode */}
          {mode === "time" && (
            <div>
              <label className="block text-white font-medium mb-2">
                Adjustment (seconds)
              </label>
              <input
                type="number"
                value={bonus}
                onChange={(e) => setBonus(Number(e.target.value))}
                className="w-full bg-gray-700 text-white text-lg px-4 py-3 rounded-xl border-2 border-gray-600 focus:border-blue-500 focus:outline-none"
                min="0"
              />
              <p className="text-gray-400 text-xs mt-2">
                Transition time (subtracted from each hold)
              </p>
            </div>
          )}

          {/* Start Button */}
          <button
            onClick={handleStart}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Play size={24} fill="white" />
            <span>Start Training</span>
          </button>
        </div>
      </div>
    </div>
  );
}
