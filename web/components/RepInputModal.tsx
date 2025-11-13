"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

interface RepInputModalProps {
  bonus: number;
  onSubmit: (reps: number) => void;
  onCancel: () => void;
}

export default function RepInputModal({
  bonus,
  onSubmit,
  onCancel,
}: RepInputModalProps) {
  const [reps, setReps] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus input and open keyboard
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = () => {
    const repsNumber = Number(reps);

    // Validation
    if (!reps || repsNumber <= 0 || isNaN(repsNumber)) {
      alert("Please enter a valid number of reps (greater than 0)");
      return;
    }

    onSubmit(repsNumber);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fadeIn">
      <div className="bg-gray-700 rounded-3xl p-8 max-w-md w-full shadow-2xl">
        {/* Header with Close Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white text-2xl font-bold">How Many Reps?</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={28} />
          </button>
        </div>

        {/* Large Number Input */}
        <input
          ref={inputRef}
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="0"
          className="w-full bg-gray-600 text-white text-6xl font-bold text-center rounded-2xl px-6 py-8 mb-8 focus:outline-none focus:ring-4 focus:ring-blue-500"
        />

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-semibold text-xl py-5 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xl py-5 rounded-xl shadow-lg active:scale-95 transition-all"
          >
            Add & Rest
          </button>
        </div>
      </div>
    </div>
  );
}
