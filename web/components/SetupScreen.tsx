"use client";

import { useState, useEffect } from "react";
import { Play, Info, Settings, BarChart3, Clock, Target, Timer, Zap } from "lucide-react";
import AboutModal from "./AboutModal";
import QuickStartModal from "./QuickStartModal";
import { getExercises, type Exercise } from "@/lib/airtable";

export type TrainingMode = "time" | "reps";

interface SetupScreenProps {
  onStart: (config: {
    mode: TrainingMode;
    target: number;
    restTime: number;
    bonus: number;
    exerciseName: string;
  }) => void;
  onManageExercises: () => void;
  onViewHistory: (exerciseName: string) => void;
}

export default function SetupScreen({ onStart, onManageExercises, onViewHistory }: SetupScreenProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAbout, setShowAbout] = useState(false);
  const [showQuickStart, setShowQuickStart] = useState(false);

  useEffect(() => {
    loadExercises();
  }, []);

  async function loadExercises() {
    try {
      const data = await getExercises();
      setExercises(data);
    } catch (error) {
      console.error("Failed to load exercises:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleExerciseSelect(exercise: Exercise) {
    onStart({
      mode: exercise.mode,
      target: exercise.default_target,
      restTime: exercise.default_rest_time,
      bonus: exercise.default_adjustment,
      exerciseName: exercise.name,
    });
  }

  if (loading) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading exercises...</div>
      </div>
    );
  }

  return (
    <>
      <div className="h-screen bg-gray-900 flex flex-col p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 mt-4">
          <button
            onClick={onManageExercises}
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            <Settings size={28} />
          </button>
          <h1 className="text-2xl font-bold text-white">Training Presets</h1>
          <div className="w-12" /> {/* Spacer for symmetry */}
        </div>

        {/* Quick Start Button */}
        <button
          onClick={() => setShowQuickStart(true)}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 mb-4"
        >
          <Zap size={24} />
          <span>Quick Start</span>
        </button>

        {/* Preset List */}
        <div className="flex-1 overflow-y-auto space-y-3">
          {exercises.length === 0 ? (
            <div className="text-center text-white/60 mt-12">
              <p className="text-lg mb-4">No exercises yet</p>
              <p className="text-sm mb-6">Create your first preset</p>
              <button
                onClick={onManageExercises}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-8 py-3 rounded-xl transition-colors"
              >
                Create Preset
              </button>
            </div>
          ) : (
            exercises.map((exercise) => (
              <div
                key={exercise.id}
                className="w-full bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 hover:bg-gray-700/80 transition-colors"
              >
                {/* Exercise Name & Play Button */}
                <div className="flex justify-between items-center mb-3">
                  <button
                    onClick={() => handleExerciseSelect(exercise)}
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    <div className="bg-white/10 p-2 rounded-lg">
                      <Play size={24} className="text-white" fill="white" />
                    </div>
                    <div>
                      <h3 className="text-white text-xl font-bold">{exercise.name}</h3>
                      <p className="text-gray-400 text-sm">
                        {exercise.mode === "time" ? "Time Mode" : "Reps Mode"}
                      </p>
                    </div>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewHistory(exercise.name);
                    }}
                    className="text-gray-400 hover:text-white transition-colors p-2"
                  >
                    <BarChart3 size={24} />
                  </button>
                </div>

                {/* Exercise Stats */}
                <div className={`grid ${exercise.mode === "time" ? "grid-cols-3" : "grid-cols-2"} gap-3 mt-3 pt-3 border-t border-white/10`}>
                  <div className="text-center">
                    <p className="text-gray-400 text-xs mb-1 flex items-center justify-center gap-1">
                      <Target size={12} />
                      TARGET
                    </p>
                    <p className="text-white font-bold text-lg">
                      {exercise.default_target}
                      {exercise.mode === "time" ? "s" : ""}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-xs mb-1 flex items-center justify-center gap-1">
                      <Clock size={12} />
                      REST
                    </p>
                    <p className="text-white font-bold text-lg">
                      {exercise.default_rest_time}s
                    </p>
                  </div>
                  {exercise.mode === "time" && (
                    <div className="text-center">
                      <p className="text-gray-400 text-xs mb-1 flex items-center justify-center gap-1">
                        <Timer size={12} />
                        ADJUSTMENT
                      </p>
                      <p className="text-white font-bold text-lg">
                        {exercise.default_adjustment}s
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Info Button - Fixed at bottom */}
        <button
          onClick={() => setShowAbout(true)}
          className="mt-4 w-full bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <Info size={20} />
          <span>About & Help</span>
        </button>
      </div>

      {/* About Modal */}
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}

      {/* Quick Start Modal */}
      {showQuickStart && (
        <QuickStartModal
          onClose={() => setShowQuickStart(false)}
          onStart={(config) => {
            setShowQuickStart(false);
            onStart(config);
          }}
        />
      )}
    </>
  );
}
