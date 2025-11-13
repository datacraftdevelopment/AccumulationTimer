"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";
import {
  getExercises,
  createExercise,
  updateExercise,
  deleteExercise,
  type Exercise,
} from "@/lib/airtable";

interface ExercisesScreenProps {
  onBack: () => void;
}

export default function ExercisesScreen({ onBack }: ExercisesScreenProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formMode, setFormMode] = useState<"time" | "reps">("time");
  const [formTarget, setFormTarget] = useState(60);
  const [formRestTime, setFormRestTime] = useState(15);
  const [formAdjustment, setFormAdjustment] = useState(5);

  useEffect(() => {
    loadExercises();
  }, []);

  async function loadExercises() {
    try {
      setLoading(true);
      const data = await getExercises();
      setExercises(data);
    } catch (error) {
      console.error("Failed to load exercises:", error);
      alert("Failed to load exercises. Check your Airtable connection.");
    } finally {
      setLoading(false);
    }
  }

  function openNewForm() {
    setEditingExercise(null);
    setFormName("");
    setFormMode("time");
    setFormTarget(60);
    setFormRestTime(15);
    setFormAdjustment(5);
    setShowForm(true);
  }

  function openEditForm(exercise: Exercise) {
    setEditingExercise(exercise);
    setFormName(exercise.name);
    setFormMode(exercise.mode);
    setFormTarget(exercise.default_target);
    setFormRestTime(exercise.default_rest_time);
    setFormAdjustment(exercise.default_adjustment);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingExercise(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formName.trim()) {
      alert("Exercise name is required");
      return;
    }

    try {
      const exerciseData = {
        name: formName.trim(),
        mode: formMode,
        default_target: formTarget,
        default_rest_time: formRestTime,
        default_adjustment: formAdjustment,
      };

      if (editingExercise) {
        await updateExercise(editingExercise.id, exerciseData);
      } else {
        await createExercise(exerciseData);
      }

      closeForm();
      loadExercises();
    } catch (error) {
      console.error("Failed to save exercise:", error);
      alert("Failed to save exercise. Please try again.");
    }
  }

  async function handleDelete(exercise: Exercise) {
    if (!confirm(`Delete "${exercise.name}"? This cannot be undone.`)) {
      return;
    }

    try {
      await deleteExercise(exercise.id);
      loadExercises();
    } catch (error) {
      console.error("Failed to delete exercise:", error);
      alert("Failed to delete exercise. Please try again.");
    }
  }

  if (loading) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading exercises...</div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="h-screen bg-gray-900 flex flex-col p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6 mt-4">
          <h1 className="text-white text-2xl font-bold">
            {editingExercise ? "Edit Exercise" : "New Exercise"}
          </h1>
          <button
            onClick={closeForm}
            className="text-white/70 hover:text-white text-sm font-medium px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Exercise Name */}
          <div>
            <label className="block text-white text-lg font-medium mb-2">
              Exercise Name
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g., Straight Handstand"
              className="w-full bg-white/10 text-white text-xl px-4 py-3 rounded-xl border-2 border-white/20 focus:border-blue-400 focus:outline-none"
              required
            />
          </div>

          {/* Mode Selection */}
          <div>
            <label className="block text-white text-lg font-medium mb-2">
              Training Mode
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setFormMode("time")}
                className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all ${
                  formMode === "time"
                    ? "bg-green-500 text-white"
                    : "bg-white/10 text-white/60"
                }`}
              >
                Time
              </button>
              <button
                type="button"
                onClick={() => setFormMode("reps")}
                className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all ${
                  formMode === "reps"
                    ? "bg-blue-500 text-white"
                    : "bg-white/10 text-white/60"
                }`}
              >
                Reps
              </button>
            </div>
          </div>

          {/* Target */}
          <div>
            <label className="block text-white text-lg font-medium mb-2">
              Default Target {formMode === "time" ? "(seconds)" : "(reps)"}
            </label>
            <input
              type="number"
              value={formTarget}
              onChange={(e) => setFormTarget(parseInt(e.target.value) || 0)}
              min="1"
              className="w-full bg-white/10 text-white text-xl px-4 py-3 rounded-xl border-2 border-white/20 focus:border-blue-400 focus:outline-none"
              required
            />
          </div>

          {/* Rest Time */}
          <div>
            <label className="block text-white text-lg font-medium mb-2">
              Default Rest Time (seconds)
            </label>
            <input
              type="number"
              value={formRestTime}
              onChange={(e) => setFormRestTime(parseInt(e.target.value) || 0)}
              min="0"
              className="w-full bg-white/10 text-white text-xl px-4 py-3 rounded-xl border-2 border-white/20 focus:border-blue-400 focus:outline-none"
              required
            />
          </div>

          {/* Adjustment */}
          <div>
            <label className="block text-white text-lg font-medium mb-2">
              Default Adjustment
            </label>
            <p className="text-white/60 text-sm mb-2">
              {formMode === "time"
                ? "Transition time penalty (subtracted from hold time)"
                : "Bonus reps (added to completed reps)"}
            </p>
            <input
              type="number"
              value={formAdjustment}
              onChange={(e) => setFormAdjustment(parseInt(e.target.value) || 0)}
              min="0"
              className="w-full bg-white/10 text-white text-xl px-4 py-3 rounded-xl border-2 border-white/20 focus:border-blue-400 focus:outline-none"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold text-xl py-4 rounded-2xl shadow-2xl transition-all active:scale-95"
          >
            {editingExercise ? "Save Changes" : "Create Exercise"}
          </button>
        </form>
      </div>
    );
  }

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
        <h1 className="text-white text-2xl font-bold">My Exercises</h1>
        <button
          onClick={openNewForm}
          className="text-white bg-blue-500 hover:bg-blue-600 p-2 rounded-lg transition-colors"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Exercise List */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {exercises.length === 0 ? (
          <div className="text-center text-white/60 mt-12">
            <p className="text-lg mb-4">No exercises yet</p>
            <p className="text-sm">Tap the + button to create your first exercise</p>
          </div>
        ) : (
          exercises.map((exercise) => (
            <div
              key={exercise.id}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-4"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="text-white text-xl font-bold">
                    {exercise.name}
                  </h3>
                  <p className="text-white/60 text-sm">
                    {exercise.mode === "time" ? "Time Mode" : "Reps Mode"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditForm(exercise)}
                    className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(exercise)}
                    className="text-red-400 hover:text-red-300 bg-white/10 hover:bg-red-500/20 p-2 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-3">
                <div className="text-center">
                  <p className="text-white/60 text-xs">Target</p>
                  <p className="text-white font-bold">
                    {exercise.default_target}
                    {exercise.mode === "time" ? "s" : ""}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-white/60 text-xs">Rest</p>
                  <p className="text-white font-bold">
                    {exercise.default_rest_time}s
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-white/60 text-xs">
                    {exercise.mode === "time" ? "Penalty" : "Bonus"}
                  </p>
                  <p className="text-white font-bold">
                    {exercise.default_adjustment}
                    {exercise.mode === "time" ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
