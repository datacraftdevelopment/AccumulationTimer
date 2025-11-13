"use client";

import { useEffect, useState } from "react";
import { formatSeconds, formatTime } from "@/lib/utils";
import { Trophy, RotateCcw, Zap } from "lucide-react";
import { createSession, createAttempts, getSessions, getAttemptsForSessions } from "@/lib/airtable";
import type { TrainingMode } from "./SetupScreen";
import type { Attempt } from "./TimeTrainingScreen";

interface PersonalRecords {
  bestHold: boolean;
  fastestCompletion: boolean;
  highestTotal: boolean;
}

interface CompletionScreenProps {
  mode: TrainingMode;
  totalAccumulated: number;
  target: number;
  restTime: number;
  adjustment: number;
  exerciseName: string;
  attempts: Attempt[];
  sessionDuration: number;
  onNewSession: () => void;
}

export default function CompletionScreen({
  mode,
  totalAccumulated,
  target,
  restTime,
  adjustment,
  exerciseName,
  attempts,
  sessionDuration,
  onNewSession,
}: CompletionScreenProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [prs, setPrs] = useState<PersonalRecords>({
    bestHold: false,
    fastestCompletion: false,
    highestTotal: false,
  });
  const [checkingPrs, setCheckingPrs] = useState(true);

  useEffect(() => {
    checkPersonalRecords();
    saveSession();
  }, []);

  async function checkPersonalRecords() {
    // Skip PR check for Quick Sessions
    if (exerciseName === "Quick Session") {
      setCheckingPrs(false);
      return;
    }

    try {
      // Get previous sessions for this exercise
      const previousSessions = await getSessions(exerciseName);

      if (previousSessions.length === 0) {
        // First session ever - all PRs!
        setPrs({
          bestHold: true,
          fastestCompletion: true,
          highestTotal: true,
        });
        setCheckingPrs(false);
        return;
      }

      // Calculate current best hold
      const currentBestHold = Math.max(...attempts.map(a => a.value));

      // Get all attempt data for previous sessions
      const sessionIds = previousSessions.map(s => s.id!);
      const previousAttempts = await getAttemptsForSessions(sessionIds);

      // Find historical best hold
      let historicalBestHold = 0;
      for (const sessionId in previousAttempts) {
        const sessionAttempts = previousAttempts[sessionId];
        const sessionBest = Math.max(...sessionAttempts.map(a => a.value));
        if (sessionBest > historicalBestHold) {
          historicalBestHold = sessionBest;
        }
      }

      // Find historical fastest completion
      const historicalFastestCompletion = Math.min(...previousSessions.map(s => s.session_duration));

      // Find historical highest total
      const historicalHighestTotal = Math.max(...previousSessions.map(s => s.total_accumulated));

      setPrs({
        bestHold: currentBestHold > historicalBestHold,
        fastestCompletion: sessionDuration < historicalFastestCompletion,
        highestTotal: totalAccumulated > historicalHighestTotal,
      });
    } catch (error) {
      console.error("Failed to check PRs:", error);
    } finally {
      setCheckingPrs(false);
    }
  }

  async function saveSession() {
    // Skip saving for Quick Sessions
    if (exerciseName === "Quick Session") {
      return;
    }

    try {
      setSaving(true);

      // Create session record
      const session = await createSession({
        exercise_name: exerciseName,
        mode,
        target,
        rest_time: restTime,
        adjustment,
        total_accumulated: totalAccumulated,
        session_duration: sessionDuration,
        attempt_count: attempts.length,
      });

      // Create attempt records
      const attemptRecords = attempts.map((attempt, index) => ({
        session_ref: session.id!,
        attempt_number: index + 1,
        value: attempt.value,
        adjustment: attempt.bonus,
        total_counted: attempt.total,
      }));

      await createAttempts(attemptRecords);

      setSaved(true);
    } catch (error) {
      console.error("Failed to save session:", error);
      // Continue anyway - user can still see results
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="h-screen bg-blue-600 flex flex-col p-6">
      {/* Celebration Header */}
      <div className="text-center mt-4 mb-4">
        <div className="flex justify-center mb-2">
          <Trophy size={60} className="text-yellow-300" />
        </div>
        <h1 className="text-white text-4xl font-bold mb-1">Goal Complete!</h1>
        <p className="text-white/80 text-base">
          {saving ? "Saving session..." : saved ? "Session saved ✓" : "Great work!"}
        </p>
      </div>

      {/* Session Summary Card */}
      <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 mb-4">
        <h2 className="text-white text-xl font-semibold mb-4 text-center">
          Session Summary
        </h2>

        <div className="space-y-2 text-white">
          <div className="flex justify-between items-center">
            <span className="text-white/80 flex items-center gap-2">
              Total:
              {!checkingPrs && prs.highestTotal && (
                <span className="flex items-center gap-1 text-yellow-300 text-xs font-bold">
                  <Zap size={14} fill="currentColor" />
                  PR
                </span>
              )}
            </span>
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
            <span className="text-white/80 flex items-center gap-2">
              Duration:
              {!checkingPrs && prs.fastestCompletion && (
                <span className="flex items-center gap-1 text-yellow-300 text-xs font-bold">
                  <Zap size={12} fill="currentColor" />
                  PR
                </span>
              )}
            </span>
            <span className="font-semibold">{formatTime(sessionDuration)}</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-white/80 flex items-center gap-2">
              Best {mode === "time" ? "Hold" : "Set"}:
              {!checkingPrs && prs.bestHold && (
                <span className="flex items-center gap-1 text-yellow-300 text-xs font-bold">
                  <Zap size={12} fill="currentColor" />
                  PR
                </span>
              )}
            </span>
            <span className="font-semibold">
              {mode === "time"
                ? formatSeconds(Math.max(...attempts.map(a => a.value)))
                : `${Math.floor(Math.max(...attempts.map(a => a.value)))} reps`}
            </span>
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
                <th className="py-2 px-2 text-right">
                  {mode === "time" ? "Adj." : "Bonus"}
                </th>
                <th className="py-2 px-2 text-right">Counted</th>
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
