//
//  RepsTrainingView.swift
//  AccumulationTracker
//
//  Reps-based training screen with manual rep entry
//

import SwiftUI

struct RepsTrainingView: View {
    let target: Double
    let adjustment: Double
    let totalAccumulated: Double
    let attemptCount: Int

    let onDoneWithSet: (Double) -> Void
    let onReset: () -> Void

    @State private var showRepInput = false
    @State private var showResetAlert = false

    var body: some View {
        ZStack {
            Color.repsActive
                .ignoresSafeArea()

            VStack(spacing: 0) {
                // Header with set counter and reset
                HStack {
                    Text("Set #\(attemptCount + 1)")
                        .font(.system(size: 20, weight: .semibold))
                        .foregroundColor(.white)

                    Spacer()

                    Button(action: { showResetAlert = true }) {
                        Text("Reset")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(.white.opacity(0.7))
                            .padding(.horizontal, 16)
                            .padding(.vertical, 8)
                            .background(Color.white.opacity(0.1))
                            .cornerRadius(8)
                    }
                }
                .padding()
                .padding(.top, 20)

                Spacer()

                // Main Display
                VStack(spacing: 8) {
                    Text("\(Int(totalAccumulated)) / \(Int(target))")
                        .font(.system(size: 80, weight: .bold))
                        .foregroundColor(.white)
                        .monospacedDigit()

                    Text("reps accumulated")
                        .font(.system(size: 24, weight: .medium))
                        .foregroundColor(.white.opacity(0.8))
                }

                Spacer()

                // Progress Section
                VStack(spacing: 16) {
                    HStack {
                        Text("\(Int(totalAccumulated))")
                            .font(.system(size: 28, weight: .bold))
                            .foregroundColor(.white)

                        Text("/")
                            .font(.system(size: 28, weight: .bold))
                            .foregroundColor(.white.opacity(0.6))

                        Text("\(Int(target))")
                            .font(.system(size: 28, weight: .bold))
                            .foregroundColor(.white)
                    }

                    // Progress Bar
                    GeometryReader { geometry in
                        ZStack(alignment: .leading) {
                            Rectangle()
                                .fill(Color.white.opacity(0.2))
                                .frame(height: 20)
                                .cornerRadius(10)

                            Rectangle()
                                .fill(Color.white)
                                .frame(width: geometry.size.width * CGFloat(min(progressPercent / 100, 1.0)), height: 20)
                                .cornerRadius(10)
                        }
                    }
                    .frame(height: 20)

                    Text("\(Int(remaining)) reps remaining")
                        .font(.system(size: 20, weight: .semibold))
                        .foregroundColor(.white)
                }
                .padding(24)
                .background(Color.white.opacity(0.1))
                .cornerRadius(24)
                .padding()

                // Done With Set Button
                Button(action: { showRepInput = true }) {
                    Text("Done With Set")
                        .font(.system(size: 28, weight: .bold))
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 32)
                        .background(Color.orange)
                        .cornerRadius(16)
                }
                .padding()
            }
        }
        .sheet(isPresented: $showRepInput) {
            RepInputSheet(adjustment: adjustment) { reps in
                onDoneWithSet(reps)
            }
        }
        .alert("Reset Session?", isPresented: $showResetAlert) {
            Button("Cancel", role: .cancel) { }
            Button("Reset", role: .destructive) {
                onReset()
            }
        } message: {
            Text("All progress will be lost.")
        }
    }

    private var remaining: Double {
        max(0, target - totalAccumulated)
    }

    private var progressPercent: Double {
        min(100, (totalAccumulated / target) * 100)
    }
}

// Rep Input Sheet
struct RepInputSheet: View {
    let adjustment: Double
    let onSubmit: (Double) -> Void

    @Environment(\.dismiss) var dismiss
    @State private var repsText: String = ""
    @FocusState private var isFocused: Bool

    var body: some View {
        NavigationView {
            VStack(spacing: 24) {
                Spacer()

                VStack(spacing: 16) {
                    Text("How many reps?")
                        .font(.title)
                        .fontWeight(.bold)

                    TextField("", text: $repsText)
                        .keyboardType(.numberPad)
                        .font(.system(size: 64, weight: .bold))
                        .multilineTextAlignment(.center)
                        .padding()
                        .background(Color.gray.opacity(0.1))
                        .cornerRadius(12)
                        .focused($isFocused)

                    if adjustment > 0 {
                        Text("+ \(Int(adjustment)) bonus reps = \(totalReps) total")
                            .font(.headline)
                            .foregroundColor(.secondary)
                    }
                }
                .padding()

                Spacer()

                Button(action: handleSubmit) {
                    Text("Add Reps & Rest")
                        .font(.system(size: 24, weight: .bold))
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 20)
                        .background(isValid ? Color.blue : Color.gray)
                        .cornerRadius(16)
                }
                .disabled(!isValid)
                .padding()
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
            .onAppear {
                isFocused = true
            }
        }
    }

    private var repsValue: Double {
        Double(repsText) ?? 0
    }

    private var totalReps: Int {
        Int(repsValue + adjustment)
    }

    private var isValid: Bool {
        repsValue > 0
    }

    private func handleSubmit() {
        guard isValid else { return }
        onSubmit(repsValue)
        dismiss()
    }
}
