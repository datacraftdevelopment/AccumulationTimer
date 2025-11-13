//
//  Utils.swift
//  AccumulationTracker
//
//  Utility functions for formatting display values
//

import Foundation
import SwiftUI

/// Format seconds as "XXs" (no decimal)
func formatSeconds(_ seconds: Double) -> String {
    return "\(Int(seconds))s"
}

/// Format seconds with one decimal place for active timer display
func formatSecondsWithDecimal(_ seconds: Double) -> String {
    return String(format: "%.1fs", seconds)
}

/// Format time in MM:SS format for session duration
func formatTime(_ seconds: Int) -> String {
    let mins = seconds / 60
    let secs = seconds % 60
    return String(format: "%d:%02d", mins, secs)
}

/// Format reps count
func formatReps(_ reps: Double) -> String {
    let count = Int(reps)
    return "\(count) \(count == 1 ? "rep" : "reps")"
}

/// Format countdown timer (always in seconds)
func formatCountdown(_ seconds: Int) -> String {
    return "\(seconds)s"
}

/// Color extension for hex color support
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// App color scheme
extension Color {
    static let setupBackground = Color(hex: "#1f2937")
    static let timeActive = Color(hex: "#10b981")
    static let repsActive = Color(hex: "#3b82f6")
    static let resting = Color(hex: "#f59e0b")
    static let complete = Color(hex: "#2563eb")
}
