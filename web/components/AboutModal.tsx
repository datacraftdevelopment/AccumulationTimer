"use client";

import { X } from "lucide-react";

interface AboutModalProps {
  onClose: () => void;
}

export default function AboutModal({ onClose }: AboutModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-2xl font-bold text-gray-900">About Accumulation Timer</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* What is Accumulation Training */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              What is Accumulation Training?
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Accumulation training breaks down your workout into manageable sets with rest periods.
              Instead of doing all reps or time at once, you accumulate toward your goal over multiple
              attempts, allowing you to maintain better form and intensity.
            </p>
          </section>

          {/* Training Modes */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Training Modes
            </h3>
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <h4 className="font-semibold text-green-900 mb-1">Time Mode</h4>
                <p className="text-green-800 text-sm">
                  Hold a position (like plank or handstand) and bail out when needed.
                  The timer tracks your hold time automatically.
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h4 className="font-semibold text-blue-900 mb-1">Reps Mode</h4>
                <p className="text-blue-800 text-sm">
                  Complete as many reps as you can, then enter the number.
                  Perfect for exercises like pull-ups or push-ups.
                </p>
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              How It Works
            </h3>
            <ol className="space-y-2 text-gray-700">
              <li className="flex gap-3">
                <span className="font-semibold text-indigo-600 min-w-[24px]">1.</span>
                <span>Set your target (total time or reps you want to accumulate)</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-indigo-600 min-w-[24px]">2.</span>
                <span>Set rest time between sets</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-indigo-600 min-w-[24px]">3.</span>
                <span>Add adjustment value (Time mode: subtracted from holds; Reps mode: added bonus)</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-indigo-600 min-w-[24px]">4.</span>
                <span>Perform your exercise and bail out or log reps when done</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-indigo-600 min-w-[24px]">5.</span>
                <span>Rest, then repeat until you reach your target</span>
              </li>
            </ol>
          </section>

          {/* Tips */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Tips
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex gap-3">
                <span className="text-indigo-600">•</span>
                <span>Start with conservative targets and build up gradually</span>
              </li>
              <li className="flex gap-3">
                <span className="text-indigo-600">•</span>
                <span><strong>Time mode:</strong> Adjustment represents transition time (e.g., 10s hold - 5s adjustment = 5s counted). Set to 0 if you want full hold time to count.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-indigo-600">•</span>
                <span><strong>Reps mode:</strong> Adjustment adds bonus reps to each set (e.g., 10 reps + 2 bonus = 12 counted)</span>
              </li>
              <li className="flex gap-3">
                <span className="text-indigo-600">•</span>
                <span>Listen to the audio cues during rest (3-second warning and completion beep)</span>
              </li>
              <li className="flex gap-3">
                <span className="text-indigo-600">•</span>
                <span>You can skip rest periods if you feel ready to continue</span>
              </li>
              <li className="flex gap-3">
                <span className="text-indigo-600">•</span>
                <span>Use the Reset button during training if you need to start over</span>
              </li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-3xl">
          <button
            onClick={onClose}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
}
