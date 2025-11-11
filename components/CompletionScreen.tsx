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
    <div className="min-h-screen bg-blue-600 flex flex-col p-6 overflow-y-auto">
      {/* Celebration Header */}
      <div className="text-center mt-8 mb-8">
        <div className="flex justify-center mb-4">
          <Trophy size={80} className="text-yellow-300" />
        </div>
        <h1 className="text-white text-5xl font-bold mb-2">Goal Complete!</h1>
        <p className="text-white/80 text-xl">Great work on finishing your session</p>
      </div>

      {/* Session Summary Card */}
      <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 mb-6">
        <h2 className="text-white text-2xl font-semibold mb-6 text-center">
          Session Summary
        </h2>

        <div className="space-y-4 text-white">
          <div className="flex justify-between items-center text-lg">
            <span className="text-white/80">Total Accumulated:</span>
            <span className="font-bold text-2xl">
              {mode === "time"
                ? formatSeconds(totalAccumulated)
                : `${totalAccumulated} reps`}
            </span>
          </div>

          <div className="flex justify-between items-center text-lg">
            <span className="text-white/80">Target:</span>
            <span className="font-semibold">
              {mode === "time" ? formatSeconds(target) : `${target} reps`}
            </span>
          </div>

          <div className="flex justify-between items-center text-lg">
            <span className="text-white/80">Total Attempts:</span>
            <span className="font-semibold">{attempts.length}</span>
          </div>

          <div className="flex justify-between items-center text-lg">
            <span className="text-white/80">Session Duration:</span>
            <span className="font-semibold">{formatTime(sessionDuration)}</span>
          </div>
        </div>
      </div>

      {/* Attempt History */}
      <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 mb-6">
        <h2 className="text-white text-xl font-semibold mb-4">Attempt History</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-white text-sm">
            <thead>
              <tr className="border-b border-white/20">
                <th className="py-2 px-2 text-left">Attempt</th>
                <th className="py-2 px-2 text-right">
                  {mode === "time" ? "Hold Time" : "Reps"}
                </th>
                <th className="py-2 px-2 text-right">Bonus</th>
                <th className="py-2 px-2 text-right">Total Added</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((attempt, index) => (
                <tr key={index} className="border-b border-white/10">
                  <td className="py-3 px-2 font-semibold">{index + 1}</td>
                  <td className="py-3 px-2 text-right">
                    {mode === "time"
                      ? formatSeconds(attempt.value)
                      : `${Math.floor(attempt.value)}`}
                  </td>
                  <td className="py-3 px-2 text-right">
                    {mode === "time"
                      ? formatSeconds(attempt.bonus)
                      : `${Math.floor(attempt.bonus)}`}
                  </td>
                  <td className="py-3 px-2 text-right font-bold">
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

      {/* New Session Button */}
      <div className="mt-auto pb-6">
        <button
          onClick={onNewSession}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold text-2xl py-6 rounded-2xl shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <RotateCcw size={28} />
          New Session
        </button>
      </div>
    </div>
  );
}
