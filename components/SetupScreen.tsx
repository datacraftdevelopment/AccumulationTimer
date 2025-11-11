"use client";

import { useState } from "react";
import { Play, Info } from "lucide-react";
import AboutModal from "./AboutModal";

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
  const [target, setTarget] = useState<string>("60");
  const [restTime, setRestTime] = useState<string>("15");
  const [bonus, setBonus] = useState<string>("5");
  const [showAbout, setShowAbout] = useState(false);

  // Update defaults when mode changes
  const handleModeChange = (newMode: TrainingMode) => {
    setMode(newMode);
    if (newMode === "time") {
      setTarget("60");
      setBonus("5");
    } else {
      setTarget("20");
      setBonus("2");
    }
  };

  const handleStart = () => {
    const targetNum = parseInt(target) || 0;
    const restTimeNum = parseInt(restTime) || 0;
    const bonusNum = parseInt(bonus) || 0;

    // Validation
    if (targetNum < 1) {
      alert("Target must be at least 1");
      return;
    }
    if (restTimeNum < 0) {
      alert("Rest time cannot be negative");
      return;
    }
    if (bonusNum < 0) {
      alert("Bonus cannot be negative");
      return;
    }

    onStart({ mode, target: targetNum, restTime: restTimeNum, bonus: bonusNum });
  };

  return (
    <>
      <div className="h-screen bg-gray-800 flex flex-col p-6">
        {/* Header */}
        <div className="text-center mb-8 mt-8 relative">
          <h1 className="text-3xl font-bold text-white mb-2">Accumulation Timer</h1>
          <p className="text-gray-400 text-sm">Configure your training session</p>

          {/* About Button */}
          <button
            onClick={() => setShowAbout(true)}
            className="absolute top-0 right-0 text-gray-400 hover:text-white transition-colors p-2"
          >
            <Info size={24} />
          </button>
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
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={target}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setTarget(value);
              }}
              className="w-full bg-gray-600 text-white text-2xl font-bold rounded-xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-green-500"
            />
          </div>

          {/* Rest Time Input */}
          <div className="mb-6">
            <label className="block text-white text-base font-medium mb-2">
              Rest Time (seconds)
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={restTime}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setRestTime(value);
              }}
              className="w-full bg-gray-600 text-white text-2xl font-bold rounded-xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-green-500"
            />
          </div>

          {/* Bonus Input */}
          <div className="mb-2">
            <label className="block text-white text-base font-medium mb-2">
              {mode === "time" ? "Adjustment Per Bail (seconds)" : "Adjustment Per Set (reps)"}
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={bonus}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setBonus(value);
              }}
              className="w-full bg-gray-600 text-white text-2xl font-bold rounded-xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-green-500"
            />
            <p className="text-gray-400 text-sm mt-2">
              {mode === "time"
                ? "Transition time subtracted from each hold (e.g., 10s hold - 5s = 5s counted)"
                : "Bonus reps added when you complete a set"}
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

      {/* About Modal */}
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
    </>
  );
}
