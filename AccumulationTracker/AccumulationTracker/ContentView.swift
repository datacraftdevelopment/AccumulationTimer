//
//  ContentView.swift
//  AccumulationTracker
//
//  Main app view with state management
//

import SwiftUI

struct ContentView: View {
    @StateObject private var presetManager = PresetManager.shared
    @State private var appState: AppState = .setup
    @State private var config: TrainingConfig?
    @State private var selectedPreset: Preset?
    @State private var totalAccumulated: Double = 0
    @State private var attempts: [Attempt] = []
    @State private var restCountdown: Int = 0
    @State private var sessionStartTime: Date = Date()

    var body: some View {
        Group {
            switch appState {
            case .setup:
                SetupView(
                    config: $config,
                    appState: $appState,
                    selectedPreset: $selectedPreset,
                    presetManager: presetManager
                )
                .onAppear {
                    // Disable idle timer during training
                    UIApplication.shared.isIdleTimerDisabled = false
                }

            case .training:
                if let config = config {
                    if config.mode == .time {
                        TimeTrainingView(
                            target: config.target,
                            adjustment: config.adjustment,
                            totalAccumulated: totalAccumulated,
                            attemptCount: attempts.count,
                            onBailOut: { currentValue in
                                handleBailOut(currentValue: currentValue)
                            },
                            onStop: { currentValue in
                                handleStop(currentValue: currentValue)
                            },
                            onReset: handleReset
                        )
                    } else {
                        RepsTrainingView(
                            target: config.target,
                            adjustment: config.adjustment,
                            totalAccumulated: totalAccumulated,
                            attemptCount: attempts.count,
                            onDoneWithSet: { reps in
                                handleDoneWithSet(reps: reps)
                            },
                            onReset: handleReset
                        )
                    }
                }

            case .resting:
                if let config = config {
                    RestView(
                        mode: config.mode,
                        target: config.target,
                        totalAccumulated: totalAccumulated,
                        restCountdown: $restCountdown,
                        onRestComplete: handleRestComplete,
                        onSkipRest: handleSkipRest
                    )
                }

            case .complete:
                if let config = config {
                    CompletionView(
                        mode: config.mode,
                        target: config.target,
                        totalAccumulated: totalAccumulated,
                        attempts: attempts,
                        sessionDuration: sessionDuration,
                        onNewSession: handleNewSession
                    )
                }
            }
        }
        .onChange(of: appState) { oldValue, newValue in
            // Enable screen wake lock during training/resting
            if newValue == .training || newValue == .resting {
                UIApplication.shared.isIdleTimerDisabled = true
            } else {
                UIApplication.shared.isIdleTimerDisabled = false
            }

            // Reset session start time when starting training
            if oldValue == .setup && newValue == .training {
                sessionStartTime = Date()
            }
        }
    }

    // MARK: - Event Handlers

    private func handleBailOut(currentValue: Double) {
        guard let config = config else { return }

        // Subtraction model: holdTime - adjustment = time that counts
        let timeCounted = max(0, currentValue - config.adjustment)
        let newTotal = totalAccumulated + timeCounted

        attempts.append(Attempt(
            value: currentValue,
            adjustment: config.adjustment,
            total: timeCounted,
            timestamp: Date()
        ))
        totalAccumulated = newTotal

        // Check if target reached
        if newTotal >= config.target {
            saveSessionHistory()
            appState = .complete
        } else {
            // Start rest period
            restCountdown = config.restTime
            appState = .resting
        }
    }

    private func handleStop(currentValue: Double) {
        guard let config = config else { return }

        // Stop without adjustment - full time counts
        let newTotal = totalAccumulated + currentValue

        attempts.append(Attempt(
            value: currentValue,
            adjustment: 0, // No adjustment for stop
            total: currentValue,
            timestamp: Date()
        ))
        totalAccumulated = newTotal

        // Always go to complete when stopping
        saveSessionHistory()
        appState = .complete
    }

    private func handleDoneWithSet(reps: Double) {
        guard let config = config else { return }

        // Addition model: reps + bonus
        let totalAdded = reps + config.adjustment
        let newTotal = totalAccumulated + totalAdded

        attempts.append(Attempt(
            value: reps,
            adjustment: config.adjustment,
            total: totalAdded,
            timestamp: Date()
        ))
        totalAccumulated = newTotal

        // Check if target reached
        if newTotal >= config.target {
            saveSessionHistory()
            appState = .complete
        } else {
            // Start rest period
            restCountdown = config.restTime
            appState = .resting
        }
    }

    private func handleRestComplete() {
        appState = .training
    }

    private func handleSkipRest() {
        appState = .training
    }

    private func handleReset() {
        appState = .setup
        config = nil
        totalAccumulated = 0
        attempts = []
        restCountdown = 0
        sessionStartTime = Date()
    }

    private func handleNewSession() {
        appState = .setup
        config = nil
        selectedPreset = nil
        totalAccumulated = 0
        attempts = []
        restCountdown = 0
        sessionStartTime = Date()
    }

    private var sessionDuration: Int {
        Int(Date().timeIntervalSince(sessionStartTime))
    }

    private func saveSessionHistory() {
        guard let preset = selectedPreset, let config = config else { return }

        let history = SessionHistory(
            presetId: preset.id,
            totalAccumulated: totalAccumulated,
            target: config.target,
            attemptCount: attempts.count,
            sessionDuration: sessionDuration,
            attempts: attempts
        )

        presetManager.saveSessionHistory(history)
    }
}

#Preview {
    ContentView()
}
