//
//  TimeTrainingView.swift
//  AccumulationTracker
//
//  Time-based training screen with live timer
//

import SwiftUI

struct TimeTrainingView: View {
    let target: Double
    let adjustment: Double
    let totalAccumulated: Double
    let attemptCount: Int

    let onBailOut: (Double) -> Void
    let onStop: (Double) -> Void
    let onReset: () -> Void

    @State private var currentValue: Double = 0
    @State private var canBail = false
    @State private var startTime = Date()
    @State private var showResetAlert = false

    let timer = Timer.publish(every: 0.1, on: .main, in: .common).autoconnect()

    var body: some View {
        ZStack {
            Color.timeActive
                .ignoresSafeArea()

            VStack(spacing: 0) {
                // Header with attempt counter and reset
                HStack {
                    Text("Attempt #\(attemptCount + 1)")
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

                // Main Timer Display
                VStack(spacing: 8) {
                    Text(formatSecondsWithDecimal(currentValue))
                        .font(.system(size: 80, weight: .bold))
                        .foregroundColor(.white)
                        .monospacedDigit()

                    Text("Hold Time")
                        .font(.system(size: 24, weight: .medium))
                        .foregroundColor(.white.opacity(0.8))
                }

                Spacer()

                // Progress Section
                VStack(spacing: 16) {
                    HStack {
                        Text(formatSecondsWithDecimal(liveTotal))
                            .font(.system(size: 28, weight: .bold))
                            .foregroundColor(.white)

                        Text("/")
                            .font(.system(size: 28, weight: .bold))
                            .foregroundColor(.white.opacity(0.6))

                        Text(formatSeconds(target))
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

                    Text("\(formatSecondsWithDecimal(remaining)) remaining")
                        .font(.system(size: 20, weight: .semibold))
                        .foregroundColor(.white)
                }
                .padding(24)
                .background(Color.white.opacity(0.1))
                .cornerRadius(24)
                .padding()

                // Action Buttons
                if targetReached {
                    // Only Stop button when target reached
                    Button(action: { handleStop() }) {
                        Text(canBail ? "Stop" : "Get Ready...")
                            .font(.system(size: 28, weight: .bold))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 32)
                            .background(canBail ? Color.red : Color.gray.opacity(0.5))
                            .cornerRadius(16)
                    }
                    .disabled(!canBail)
                    .padding()
                } else {
                    // Both buttons before target reached
                    HStack(spacing: 16) {
                        Button(action: { handleBailOut() }) {
                            Text(canBail ? "Bail Out" : "Get Ready...")
                                .font(.system(size: 28, weight: .bold))
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 32)
                                .background(canBail ? Color.orange : Color.gray.opacity(0.5))
                                .cornerRadius(16)
                        }
                        .disabled(!canBail)

                        Button(action: { handleStop() }) {
                            Text(canBail ? "Stop" : "Get Ready...")
                                .font(.system(size: 28, weight: .bold))
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 32)
                                .background(canBail ? Color.red : Color.gray.opacity(0.5))
                                .cornerRadius(16)
                        }
                        .disabled(!canBail)
                    }
                    .padding()
                }
            }
        }
        .onAppear {
            startTime = Date()
            // Enable bail after 1 second to prevent accidents
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
                canBail = true
            }
        }
        .onReceive(timer) { _ in
            currentValue = Date().timeIntervalSince(startTime)
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

    // Calculate live progress
    private var currentCounted: Double {
        max(0, currentValue - adjustment)
    }

    private var liveTotal: Double {
        totalAccumulated + currentCounted
    }

    private var remaining: Double {
        max(0, target - liveTotal)
    }

    private var progressPercent: Double {
        min(100, (liveTotal / target) * 100)
    }

    private var targetReached: Bool {
        liveTotal >= target
    }

    private func handleBailOut() {
        guard canBail else { return }
        onBailOut(currentValue)
    }

    private func handleStop() {
        guard canBail else { return }
        onStop(currentValue)
    }
}
