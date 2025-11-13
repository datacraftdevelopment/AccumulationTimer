//
//  PresetManager.swift
//  AccumulationTracker
//
//  Manages preset configurations and session history with UserDefaults persistence
//

import Foundation

class PresetManager: ObservableObject {
    static let shared = PresetManager()

    @Published var presets: [Preset] = []
    @Published var sessionHistories: [SessionHistory] = []

    private let presetsKey = "AccumulationTracker.Presets"
    private let historiesKey = "AccumulationTracker.SessionHistories"

    init() {
        loadPresets()
        loadHistories()
        createDefaultPresetsIfNeeded()
        createTestDataIfNeeded()
    }

    // MARK: - Preset Management

    func savePreset(_ preset: Preset) {
        if let index = presets.firstIndex(where: { $0.id == preset.id }) {
            presets[index] = preset
        } else {
            presets.append(preset)
        }
        persistPresets()
    }

    func deletePreset(_ preset: Preset) {
        presets.removeAll { $0.id == preset.id }
        // Also delete associated histories
        sessionHistories.removeAll { $0.presetId == preset.id }
        persistPresets()
        persistHistories()
    }

    func getPreset(id: UUID) -> Preset? {
        presets.first { $0.id == id }
    }

    // MARK: - Session History Management

    func saveSessionHistory(_ history: SessionHistory) {
        sessionHistories.append(history)
        persistHistories()
    }

    func getHistories(for presetId: UUID) -> [SessionHistory] {
        sessionHistories
            .filter { $0.presetId == presetId }
            .sorted { $0.date > $1.date } // Most recent first
    }

    func deleteHistory(_ history: SessionHistory) {
        sessionHistories.removeAll { $0.id == history.id }
        persistHistories()
    }

    // MARK: - Analytics

    func getStats(for presetId: UUID) -> PresetStats? {
        let histories = getHistories(for: presetId)
        guard !histories.isEmpty else { return nil }

        let totalSessions = histories.count
        let averageDuration = histories.map { $0.sessionDuration }.reduce(0, +) / totalSessions
        let bestDuration = histories.map { $0.sessionDuration }.min() ?? 0
        let averageAttempts = Double(histories.map { $0.attemptCount }.reduce(0, +)) / Double(totalSessions)

        // Calculate trend (last 5 vs previous 5)
        let recentSessions = Array(histories.prefix(5))
        let olderSessions = Array(histories.dropFirst(5).prefix(5))

        var trend: TrendDirection = .stable
        if !recentSessions.isEmpty && !olderSessions.isEmpty {
            let recentAvg = recentSessions.map { $0.sessionDuration }.reduce(0, +) / recentSessions.count
            let olderAvg = olderSessions.map { $0.sessionDuration }.reduce(0, +) / olderSessions.count

            if Double(recentAvg) < Double(olderAvg) * 0.95 {
                trend = .improving
            } else if Double(recentAvg) > Double(olderAvg) * 1.05 {
                trend = .declining
            }
        }

        return PresetStats(
            totalSessions: totalSessions,
            averageDuration: averageDuration,
            bestDuration: bestDuration,
            averageAttempts: averageAttempts,
            trend: trend
        )
    }

    // MARK: - Persistence

    private func persistPresets() {
        if let encoded = try? JSONEncoder().encode(presets) {
            UserDefaults.standard.set(encoded, forKey: presetsKey)
        }
    }

    private func persistHistories() {
        if let encoded = try? JSONEncoder().encode(sessionHistories) {
            UserDefaults.standard.set(encoded, forKey: historiesKey)
        }
    }

    private func loadPresets() {
        if let data = UserDefaults.standard.data(forKey: presetsKey),
           let decoded = try? JSONDecoder().decode([Preset].self, from: data) {
            presets = decoded
        }
    }

    private func loadHistories() {
        if let data = UserDefaults.standard.data(forKey: historiesKey),
           let decoded = try? JSONDecoder().decode([SessionHistory].self, from: data) {
            sessionHistories = decoded
        }
    }

    // MARK: - Default Presets

    private func createDefaultPresetsIfNeeded() {
        guard presets.isEmpty else { return }

        let defaultPresets = [
            Preset(
                name: "Straight Handstand",
                mode: .time,
                target: 60,
                restTime: 15,
                adjustment: 5
            ),
            Preset(
                name: "Tuck 7 Straddle",
                mode: .time,
                target: 45,
                restTime: 20,
                adjustment: 3
            ),
            Preset(
                name: "Pull-ups",
                mode: .reps,
                target: 20,
                restTime: 30,
                adjustment: 2
            )
        ]

        presets = defaultPresets
        persistPresets()
    }

    private func createTestDataIfNeeded() {
        // Only add test data if there's no history yet
        guard sessionHistories.isEmpty, !presets.isEmpty else { return }

        let now = Date()

        // Add test data for each preset
        for preset in presets {
            // Create 12 sessions with improving times
            for i in 0..<12 {
                let daysAgo = Double(11 - i)
                let sessionDate = Calendar.current.date(byAdding: .day, value: -Int(daysAgo), to: now)!

                // Sessions improve over time (duration decreases)
                let baseDuration = preset.mode == .time ? 180 : 120
                let improvement = Double(i) * 8 // 8 seconds improvement per session
                let sessionDuration = baseDuration - Int(improvement)

                // Number of attempts varies
                let attemptCount = Int.random(in: 3...7)

                // Generate realistic attempts
                var attempts: [Attempt] = []
                var accumulated: Double = 0

                for attemptNum in 0..<attemptCount {
                    let isLastAttempt = attemptNum == attemptCount - 1

                    if preset.mode == .time {
                        // Time mode: attempts get shorter as we approach target
                        let remaining = preset.target - accumulated
                        let attemptValue: Double

                        if isLastAttempt {
                            // Last attempt: exactly hit target
                            attemptValue = remaining + preset.adjustment
                        } else {
                            // Not last: random value that makes sense
                            let maxHold = min(remaining * 0.8, 25.0)
                            let minHold = min(8.0, maxHold * 0.5)
                            attemptValue = Double.random(in: minHold...max(minHold, maxHold)) + preset.adjustment
                        }

                        let counted = attemptValue - preset.adjustment
                        accumulated += counted

                        attempts.append(Attempt(
                            value: attemptValue,
                            adjustment: preset.adjustment,
                            total: counted,
                            timestamp: sessionDate.addingTimeInterval(Double(attemptNum) * 20)
                        ))
                    } else {
                        // Reps mode
                        let remaining = preset.target - accumulated
                        let reps: Double

                        if isLastAttempt {
                            // Last set: exactly hit target
                            reps = remaining - preset.adjustment
                        } else {
                            // Not last: random reps
                            let maxReps = min(remaining * 0.6, 8.0)
                            let minReps = min(2.0, maxReps * 0.5)
                            reps = Double(Int.random(in: Int(minReps)...max(Int(minReps), Int(maxReps))))
                        }

                        let counted = reps + preset.adjustment
                        accumulated += counted

                        attempts.append(Attempt(
                            value: reps,
                            adjustment: preset.adjustment,
                            total: counted,
                            timestamp: sessionDate.addingTimeInterval(Double(attemptNum) * 30)
                        ))
                    }
                }

                let history = SessionHistory(
                    presetId: preset.id,
                    date: sessionDate,
                    totalAccumulated: accumulated,
                    target: preset.target,
                    attemptCount: attemptCount,
                    sessionDuration: sessionDuration,
                    attempts: attempts
                )

                sessionHistories.append(history)
            }
        }

        persistHistories()
    }
}

// MARK: - Supporting Types

struct PresetStats {
    let totalSessions: Int
    let averageDuration: Int    // seconds
    let bestDuration: Int        // seconds
    let averageAttempts: Double
    let trend: TrendDirection
}

enum TrendDirection {
    case improving  // Times getting faster
    case declining  // Times getting slower
    case stable     // No significant change
}
