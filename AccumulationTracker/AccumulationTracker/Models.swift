//
//  Models.swift
//  AccumulationTracker
//
//  Core data models for the accumulation training app
//

import Foundation

/// Training mode: time-based or rep-based
enum TrainingMode: String, CaseIterable {
    case time = "Time"
    case reps = "Reps"
}

/// Current state of the application
enum AppState {
    case setup
    case training
    case resting
    case complete
}

/// Represents a single training attempt/set
struct Attempt: Identifiable {
    let id = UUID()
    let value: Double        // Hold time (seconds) or reps performed
    let adjustment: Double   // Bonus applied (subtraction for time, addition for reps)
    let total: Double        // Final counted value after adjustment
    let timestamp: Date
}

/// Training configuration from setup screen
struct TrainingConfig {
    let mode: TrainingMode
    let target: Double       // Target seconds or reps
    let restTime: Int        // Rest time in seconds
    let adjustment: Double   // Adjustment per set (penalty for time, bonus for reps)
}

/// Preset configuration with a name
struct Preset: Identifiable, Codable, Equatable {
    let id: UUID
    var name: String
    var mode: TrainingMode
    var target: Double
    var restTime: Int
    var adjustment: Double
    var createdAt: Date

    init(id: UUID = UUID(), name: String, mode: TrainingMode, target: Double, restTime: Int, adjustment: Double, createdAt: Date = Date()) {
        self.id = id
        self.name = name
        self.mode = mode
        self.target = target
        self.restTime = restTime
        self.adjustment = adjustment
        self.createdAt = createdAt
    }

    var config: TrainingConfig {
        TrainingConfig(mode: mode, target: target, restTime: restTime, adjustment: adjustment)
    }
}

/// Training mode Codable support
extension TrainingMode: Codable {
    enum CodingKeys: String, CodingKey {
        case rawValue
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        let rawValue = try container.decode(String.self)
        self = TrainingMode(rawValue: rawValue) ?? .time
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        try container.encode(self.rawValue)
    }
}

/// Session history for a preset
struct SessionHistory: Identifiable, Codable {
    let id: UUID
    let presetId: UUID
    let date: Date
    let totalAccumulated: Double
    let target: Double
    let attemptCount: Int
    let sessionDuration: Int  // Total wall time in seconds
    let attempts: [Attempt]

    init(id: UUID = UUID(), presetId: UUID, date: Date = Date(), totalAccumulated: Double, target: Double, attemptCount: Int, sessionDuration: Int, attempts: [Attempt]) {
        self.id = id
        self.presetId = presetId
        self.date = date
        self.totalAccumulated = totalAccumulated
        self.target = target
        self.attemptCount = attemptCount
        self.sessionDuration = sessionDuration
        self.attempts = attempts
    }
}

/// Attempt Codable support
extension Attempt: Codable {
    enum CodingKeys: String, CodingKey {
        case id, value, adjustment, total, timestamp
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let value = try container.decode(Double.self, forKey: .value)
        let adjustment = try container.decode(Double.self, forKey: .adjustment)
        let total = try container.decode(Double.self, forKey: .total)
        let timestamp = try container.decode(Date.self, forKey: .timestamp)

        self.init(value: value, adjustment: adjustment, total: total, timestamp: timestamp)
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(self.id, forKey: .id)
        try container.encode(self.value, forKey: .value)
        try container.encode(self.adjustment, forKey: .adjustment)
        try container.encode(self.total, forKey: .total)
        try container.encode(self.timestamp, forKey: .timestamp)
    }
}
