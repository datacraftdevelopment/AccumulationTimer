"use client";

import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import {
  getSessions,
  getAllExerciseStats,
  getAttemptsForSessions,
  type Session,
  type ExerciseStats,
} from "@/lib/airtable";
import { formatSeconds, formatTime } from "@/lib/utils";
import SessionGraph from "./SessionGraph";

interface HistoryScreenProps {
  onBack: () => void;
  initialExercise?: string | null;
}

interface GraphDataPoint {
  sessionNumber: number;
  totalAccumulated: number;
  sessionDuration: number;
  bestHold: number;
}

export default function HistoryScreen({ onBack, initialExercise }: HistoryScreenProps) {
  const [stats, setStats] = useState<ExerciseStats[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [graphData, setGraphData] = useState<GraphDataPoint[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(initialExercise || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initialExercise) {
      loadExerciseDetails(initialExercise);
    }
  }, [initialExercise]);

  async function loadExerciseDetails(exerciseName: string) {
    try {
      setLoading(true);
      const [statsData, exerciseSessions] = await Promise.all([
        getAllExerciseStats(),
        getSessions(exerciseName),
      ]);
      setStats(statsData);
      setSessions(exerciseSessions);
      setSelectedExercise(exerciseName);

      // Fetch attempt data for all sessions to calculate best holds
      if (exerciseSessions.length > 0) {
        const sessionIds = exerciseSessions.map(s => s.id!);
        const attemptsData = await getAttemptsForSessions(sessionIds);

        // Calculate graph data
        const graphPoints: GraphDataPoint[] = exerciseSessions.map((session, index) => {
          const attempts = attemptsData[session.id!] || [];
          const bestHold = attempts.length > 0
            ? Math.max(...attempts.map(a => a.value))
            : 0;

          return {
            sessionNumber: exerciseSessions.length - index, // Reverse numbering (oldest = 1)
            totalAccumulated: session.total_accumulated,
            sessionDuration: session.session_duration,
            bestHold,
          };
        });

        setGraphData(graphPoints);
      } else {
        setGraphData([]);
      }
    } catch (error) {
      console.error("Failed to load exercise details:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading history...</div>
      </div>
    );
  }

  if (!selectedExercise) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">No exercise selected</div>
      </div>
    );
  }

  const exerciseStats = stats.find(s => s.exerciseName === selectedExercise);

    return (
      <div className="h-screen bg-gray-900 flex flex-col p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 mt-4">
          <button
            onClick={onBack}
            className="text-white/70 hover:text-white flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back</span>
          </button>
          <h1 className="text-white text-2xl font-bold">{selectedExercise}</h1>
          <div className="w-16" /> {/* Spacer */}
        </div>

        {/* Progress Graph */}
        {sessions.length > 0 && (
          <SessionGraph
            data={graphData}
            mode={sessions[0].mode}
          />
        )}

        {/* Stats Summary */}
        {exerciseStats && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <p className="text-white/60 text-sm">Best Session</p>
                <p className="text-white font-bold text-2xl">
                  {sessions[0]?.mode === "time"
                    ? exerciseStats.bestSession.toFixed(1)
                    : Math.round(exerciseStats.bestSession)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-white/60 text-sm">Average</p>
                <p className="text-white font-bold text-2xl">
                  {sessions[0]?.mode === "time"
                    ? exerciseStats.averageAccumulated.toFixed(1)
                    : Math.round(exerciseStats.averageAccumulated)}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-white/60 text-sm">Avg Attempts</p>
                <p className="text-white font-bold text-xl">
                  {exerciseStats.averageAttempts.toFixed(1)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-white/60 text-sm">Avg Duration</p>
                <p className="text-white font-bold text-xl">
                  {formatTime(Math.round(exerciseStats.averageSessionDuration))}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Session History */}
        <div className="flex-1 overflow-y-auto space-y-3">
          <h2 className="text-white text-lg font-semibold mb-2">Recent Sessions</h2>
          {sessions.length === 0 ? (
            <div className="text-center text-white/60 mt-8">
              <p>No sessions recorded yet</p>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-white font-bold text-xl">
                      {session.mode === "time"
                        ? session.total_accumulated.toFixed(1) + "s"
                        : Math.round(session.total_accumulated) + " reps"}
                    </p>
                    <p className="text-white/60 text-sm">
                      Target: {session.target}{session.mode === "time" ? "s" : " reps"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/60 text-sm">
                      {new Date(session.completed_at!).toLocaleDateString()}
                    </p>
                    <p className="text-white/60 text-xs">
                      {new Date(session.completed_at!).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div>
                    <p className="text-white/60 text-xs">Attempts</p>
                    <p className="text-white font-semibold">{session.attempt_count}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs">Duration</p>
                    <p className="text-white font-semibold">
                      {formatTime(session.session_duration)}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs">Rest</p>
                    <p className="text-white font-semibold">{session.rest_time}s</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
}
