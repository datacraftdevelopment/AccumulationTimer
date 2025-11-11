"use client";

import { useState } from "react";
import { Play } from "lucide-react";

export type TrainingMode = "time" | "reps";

interface SetupScreenProps {
  onStart: (config: {
    mode: TrainingMode;
    target: number;
    restTime: number;
    bonus: number;
  }) => void;
}

export default function SetupScreen({ onStart }: SetupScreenProps) {
  const [mode, setMode] = useState<TrainingMode>("time");
  const [target, setTarget] = useState(mode === "time" ? 60 : 20);
  const [restTime, setRestTime] = useState(15);
  const [bonus, setBonus] = useState(mode === "time" ? 5 : 2);

  // Update defaults when mode changes
  const handleModeChange = (newMode: TrainingMode) => {
    setMode(newMode);
    if (newMode === "time") {
      setTarget(60);
      setBonus(5);
    } else {
      setTarget(20);
      setBonus(2);
    }
  };

  const handleStart = () => {
    // Validation
    if (target < 1 || restTime < 5 || bonus < 0) {
      alert("Please enter valid values");
      return;
    }

    onStart({ mode, target, restTime, bonus });
  };

  return (
    <div className="min-h-screen bg-gray-800 flex flex-col p-6">
      {/* Header */}
      <div className="text-center mb-8 mt-8">
        <h1 className="text-3xl font-bold text-white mb-2">Accumulation Timer</h1>
        <p className="text-gray-400 text-sm">Configure your training session</p>
      </div>

      {/* Card Container */}
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
        <div className="bg-gray-700 rounded-3xl p-8 shadow-xl">
          {/* Mode Selection */}
          <div className="mb-8">
            <label className="block text-white text-lg font-semibold mb-4">
              Training Mode
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleModeChange("time")}
                className={`py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
                  mode === "time"
                    ? "bg-green-500 text-white shadow-lg scale-105"
                    : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                }`}
              >
                Time
              </button>
              <button
                onClick={() => handleModeChange("reps")}
                className={`py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
                  mode === "reps"
                    ? "bg-green-500 text-white shadow-lg scale-105"
                    : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                }`}
              >
                Reps
              </button>
            </div>
          </div>

          {/* Target Input */}
          <div className="mb-6">
            <label className="block text-white text-base font-medium mb-2">
              {mode === "time" ? "Target Seconds" : "Target Reps"}
            </label>
            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
              min="1"
              className="w-full bg-gray-600 text-white text-2xl font-bold rounded-xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-green-500"
            />
          </div>

          {/* Rest Time Input */}
          <div className="mb-6">
            <label className="block text-white text-base font-medium mb-2">
              Rest Time (seconds)
            </label>
            <input
              type="number"
              value={restTime}
              onChange={(e) => setRestTime(Number(e.target.value))}
              min="5"
              className="w-full bg-gray-600 text-white text-2xl font-bold rounded-xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-green-500"
            />
          </div>

          {/* Bonus Input */}
          <div className="mb-2">
            <label className="block text-white text-base font-medium mb-2">
              {mode === "time" ? "Bonus Seconds Per Bail" : "Bonus Reps Per Set"}
            </label>
            <input
              type="number"
              value={bonus}
              onChange={(e) => setBonus(Number(e.target.value))}
              min="0"
              className="w-full bg-gray-600 text-white text-2xl font-bold rounded-xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-green-500"
            />
            <p className="text-gray-400 text-sm mt-2">
              Added to your total when you bail out
            </p>
          </div>
        </div>
      </div>

      {/* Start Button - Fixed at bottom */}
      <div className="mt-6 pb-6 max-w-md mx-auto w-full">
        <button
          onClick={handleStart}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold text-2xl py-6 rounded-2xl shadow-2xl active:scale-95 transition-transform flex items-center justify-center gap-3"
        >
          <Play size={32} fill="white" />
          Start Training
        </button>
      </div>
    </div>
  );
}
