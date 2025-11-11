"use client";

import { useState } from "react";
import RepInputModal from "./RepInputModal";
import type { Attempt } from "./TimeTrainingScreen";

interface RepsTrainingScreenProps {
  target: number;
  bonus: number;
  totalAccumulated: number;
  attempts: Attempt[];
  onDoneWithSet: (reps: number) => void;
}

export default function RepsTrainingScreen({
  target,
  bonus,
  totalAccumulated,
  attempts,
  onDoneWithSet,
}: RepsTrainingScreenProps) {
  const [showRepInput, setShowRepInput] = useState(false);

  const handleSubmitReps = (reps: number) => {
    setShowRepInput(false);
    onDoneWithSet(reps);
  };

  const remaining = Math.max(0, target - totalAccumulated);
  const progressPercent = Math.min(100, (totalAccumulated / target) * 100);

  return (
    <>
      <div className="min-h-screen bg-blue-500 flex flex-col p-6">
        {/* Attempt Counter */}
        <div className="text-center text-white text-xl font-semibold mb-4 mt-6">
          Set #{attempts.length + 1}
        </div>

        {/* Main Display */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-white text-8xl font-bold mb-4 tabular-nums no-select">
              {totalAccumulated} / {target}
            </div>
            <div className="text-white/80 text-2xl font-medium">
              reps accumulated
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 mb-6">
          <div className="flex justify-between text-white text-lg mb-3">
            <span>Accumulated: {totalAccumulated}</span>
            <span>Target: {target}</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/20 rounded-full h-4 mb-3 overflow-hidden">
            <div
              className="bg-white h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="text-white text-base text-center">
            Remaining: {remaining} reps
          </div>
        </div>

        {/* Done With Set Button */}
        <button
          onClick={() => setShowRepInput(true)}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-3xl py-8 rounded-2xl shadow-2xl active:scale-95 transition-all"
        >
          Done With Set
        </button>
      </div>

      {/* Rep Input Modal */}
      {showRepInput && (
        <RepInputModal
          bonus={bonus}
          onSubmit={handleSubmitReps}
          onCancel={() => setShowRepInput(false)}
        />
      )}
    </>
  );
}
