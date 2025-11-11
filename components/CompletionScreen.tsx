"use client";

import { formatSeconds, formatTime } from "@/lib/utils";
import { Trophy, RotateCcw } from "lucide-react";
import type { TrainingMode } from "./SetupScreen";
import type { Attempt } from "./TimeTrainingScreen";

interface CompletionScreenProps {
  mode: TrainingMode;
  totalAccumulated: number;
  target: number;
  attempts: Attempt[];
  sessionDuration: number;
  onNewSession: () => void;
}

export default function CompletionScreen({
  mode,
  totalAccumulated,
  target,
  attempts,
  sessionDuration,
  onNewSession,
}: CompletionScreenProps) {
  return (
    <div className="h-screen bg-blue-600 flex flex-col p-6">
      {/* Celebration Header */}
      <div className="text-center mt-4 mb-4">
        <div className="flex justify-center mb-2">
          <Trophy size={60} className="text-yellow-300" />
        </div>
        <h1 className="text-white text-4xl font-bold mb-1">Goal Complete!</h1>
        <p className="text-white/80 text-base">Great work!</p>
      </div>

      {/* Session Summary Card */}
      <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 mb-4">
        <h2 className="text-white text-xl font-semibold mb-4 text-center">
          Session Summary
        </h2>

        <div className="space-y-2 text-white">
          <div className="flex justify-between items-center">
            <span className="text-white/80">Total:</span>
            <span className="font-bold text-xl">
              {mode === "time"
                ? formatSeconds(totalAccumulated)
                : `${totalAccumulated} reps`}
            </span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-white/80">Target:</span>
            <span className="font-semibold">
              {mode === "time" ? formatSeconds(target) : `${target} reps`}
            </span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-white/80">Attempts:</span>
            <span className="font-semibold">{attempts.length}</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-white/80">Duration:</span>
            <span className="font-semibold">{formatTime(sessionDuration)}</span>
          </div>
        </div>
      </div>

      {/* Attempt History - Scrollable */}
      <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-4 flex-1 flex flex-col min-h-0 mb-4">
        <h2 className="text-white text-lg font-semibold mb-3">Attempt History</h2>

        <div className="overflow-y-auto flex-1">
          <table className="w-full text-white text-sm">
            <thead className="sticky top-0 bg-blue-600">
              <tr className="border-b border-white/20">
                <th className="py-2 px-2 text-left">#</th>
                <th className="py-2 px-2 text-right">
                  {mode === "time" ? "Hold" : "Reps"}
                </th>
                <th className="py-2 px-2 text-right">Bonus</th>
                <th className="py-2 px-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((attempt, index) => (
                <tr key={index} className="border-b border-white/10">
                  <td className="py-2 px-2 font-semibold">{index + 1}</td>
                  <td className="py-2 px-2 text-right">
                    {mode === "time"
                      ? formatSeconds(attempt.value)
                      : `${Math.floor(attempt.value)}`}
                  </td>
                  <td className="py-2 px-2 text-right">
                    {mode === "time"
                      ? formatSeconds(attempt.bonus)
                      : `${Math.floor(attempt.bonus)}`}
                  </td>
                  <td className="py-2 px-2 text-right font-bold">
                    {mode === "time"
                      ? formatSeconds(attempt.total)
                      : `${Math.floor(attempt.total)}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Session Button - Fixed at bottom */}
      <button
        onClick={onNewSession}
        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold text-2xl py-6 rounded-2xl shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3"
      >
        <RotateCcw size={28} />
        New Session
      </button>
    </div>
  );
}
