//
//  HistoryView.swift
//  AccumulationTracker
//
//  View session history and statistics for a preset
//

import SwiftUI

struct HistoryView: View {
    let preset: Preset
    @ObservedObject var presetManager: PresetManager
    @Environment(\.dismiss) var dismiss

    var histories: [SessionHistory] {
        presetManager.getHistories(for: preset.id)
    }

    var stats: PresetStats? {
        presetManager.getStats(for: preset.id)
    }

    var body: some View {
        NavigationView {
            ZStack {
                Color.setupBackground
                    .ignoresSafeArea()

                if histories.isEmpty {
                    // Empty state
                    VStack(spacing: 20) {
                        Image(systemName: "chart.xyaxis.line")
                            .font(.system(size: 60))
                            .foregroundColor(.gray)

                        Text("No History Yet")
                            .font(.title2)
                            .fontWeight(.bold)
                            .foregroundColor(.white)

                        Text("Complete a session to see your history")
                            .font(.body)
                            .foregroundColor(.gray)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal)
                    }
                } else {
                    ScrollView {
                        VStack(spacing: 20) {
                            // Statistics Summary
                            if let stats = stats {
                                VStack(spacing: 16) {
                                    Text("Statistics")
                                        .font(.system(size: 20, weight: .bold))
                                        .foregroundColor(.white)
                                        .frame(maxWidth: .infinity, alignment: .leading)

                                    // Main stats
                                    HStack(spacing: 12) {
                                        StatCard(
                                            title: "Total Sessions",
                                            value: "\(stats.totalSessions)",
                                            icon: "list.bullet",
                                            color: .blue
                                        )

                                        StatCard(
                                            title: "Avg Duration",
                                            value: formatTime(stats.averageDuration),
                                            icon: "clock",
                                            color: .green
                                        )
                                    }

                                    HStack(spacing: 12) {
                                        StatCard(
                                            title: "Best Time",
                                            value: formatTime(stats.bestDuration),
                                            icon: "star.fill",
                                            color: .yellow
                                        )

                                        StatCard(
                                            title: "Avg Attempts",
                                            value: String(format: "%.1f", stats.averageAttempts),
                                            icon: "number",
                                            color: .orange
                                        )
                                    }

                                    // Trend indicator
                                    TrendCard(trend: stats.trend)
                                }
                                .padding()
                                .background(Color.gray.opacity(0.2))
                                .cornerRadius(20)
                                .padding(.horizontal)
                            }

                            // Session history list
                            VStack(alignment: .leading, spacing: 12) {
                                Text("Session History")
                                    .font(.system(size: 20, weight: .bold))
                                    .foregroundColor(.white)
                                    .padding(.horizontal)

                                ForEach(histories) { history in
                                    SessionCard(
                                        history: history,
                                        preset: preset,
                                        onDelete: {
                                            presetManager.deleteHistory(history)
                                        }
                                    )
                                }
                            }
                        }
                        .padding(.vertical)
                    }
                }
            }
            .navigationTitle(preset.name)
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(.visible, for: .navigationBar)
            .toolbarBackground(Color.black, for: .navigationBar)
            .toolbarColorScheme(.dark, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                    .foregroundColor(.white)
                }
            }
        }
    }
}

// Stat Card Component
struct StatCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.system(size: 24))
                .foregroundColor(color)

            Text(value)
                .font(.system(size: 28, weight: .bold))
                .foregroundColor(.white)

            Text(title)
                .font(.system(size: 12))
                .foregroundColor(.gray)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color.white.opacity(0.1))
        .cornerRadius(12)
    }
}

// Trend Card Component
struct TrendCard: View {
    let trend: TrendDirection

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: trendIcon)
                .font(.system(size: 24))
                .foregroundColor(trendColor)

            VStack(alignment: .leading, spacing: 4) {
                Text("Progress Trend")
                    .font(.system(size: 14))
                    .foregroundColor(.gray)

                Text(trendText)
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(.white)
            }

            Spacer()
        }
        .padding()
        .background(Color.white.opacity(0.1))
        .cornerRadius(12)
    }

    private var trendIcon: String {
        switch trend {
        case .improving: return "arrow.down.right.circle.fill"
        case .declining: return "arrow.up.right.circle.fill"
        case .stable: return "arrow.right.circle.fill"
        }
    }

    private var trendColor: Color {
        switch trend {
        case .improving: return .green
        case .declining: return .red
        case .stable: return .gray
        }
    }

    private var trendText: String {
        switch trend {
        case .improving: return "Times are improving! 🎉"
        case .declining: return "Times are getting longer"
        case .stable: return "Times are stable"
        }
    }
}

// Session Card Component
struct SessionCard: View {
    let history: SessionHistory
    let preset: Preset
    let onDelete: () -> Void

    @State private var showDeleteAlert = false
    @State private var showDetails = false

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Main info
            Button(action: { showDetails.toggle() }) {
                VStack(spacing: 12) {
                    // Date and chevron
                    HStack {
                        Text(formatSessionValue(history.totalAccumulated))
                            .font(.system(size: 28, weight: .bold))
                            .foregroundColor(.white)

                        Spacer()

                        VStack(alignment: .trailing, spacing: 2) {
                            Text(formatDate(history.date))
                                .font(.system(size: 12))
                                .foregroundColor(.gray)

                            Image(systemName: showDetails ? "chevron.up" : "chevron.down")
                                .font(.system(size: 12))
                                .foregroundColor(.gray)
                        }
                    }

                    Text("Target: \(formatSessionValue(history.target))")
                        .font(.system(size: 12))
                        .foregroundColor(.gray)
                        .frame(maxWidth: .infinity, alignment: .leading)

                    // Stats grid (2x2)
                    HStack(spacing: 12) {
                        // Left column
                        VStack(spacing: 8) {
                            SessionStatMetric(
                                label: "Attempts",
                                value: "\(history.attemptCount)"
                            )

                            SessionStatMetric(
                                label: "Duration",
                                value: formatTime(history.sessionDuration)
                            )
                        }

                        // Right column
                        VStack(spacing: 8) {
                            SessionStatMetric(
                                label: "Rest",
                                value: "\(preset.restTime)s"
                            )

                            SessionStatMetric(
                                label: "Result",
                                value: history.totalAccumulated >= history.target ? "✓ Complete" : "Incomplete"
                            )
                        }
                    }
                }
                .padding(16)
            }

            // Detailed info (expandable)
            if showDetails {
                VStack(alignment: .leading, spacing: 12) {
                    Divider()
                        .background(Color.white.opacity(0.2))

                    VStack(alignment: .leading, spacing: 8) {
                        Text("Attempts Breakdown")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(.white.opacity(0.8))

                        ForEach(Array(history.attempts.enumerated()), id: \.element.id) { index, attempt in
                            HStack {
                                Text("#\(index + 1)")
                                    .font(.system(size: 12, weight: .semibold))
                                    .foregroundColor(.white.opacity(0.6))
                                    .frame(width: 30, alignment: .leading)

                                Text(formatAttemptValue(attempt.value))
                                    .font(.system(size: 12))
                                    .foregroundColor(.white)

                                Text("→")
                                    .font(.system(size: 12))
                                    .foregroundColor(.gray)

                                Text(formatAttemptValue(attempt.total))
                                    .font(.system(size: 12, weight: .semibold))
                                    .foregroundColor(.green)

                                Spacer()
                            }
                        }
                    }
                    .padding(.horizontal, 16)

                    // Delete button
                    Button(action: { showDeleteAlert = true }) {
                        Label("Delete Session", systemImage: "trash")
                            .font(.system(size: 14))
                            .foregroundColor(.red)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                    }
                    .background(Color.white.opacity(0.05))
                }
                .padding(.bottom, 8)
            }
        }
        .background(Color.gray.opacity(0.2))
        .cornerRadius(12)
        .padding(.horizontal)
        .alert("Delete Session?", isPresented: $showDeleteAlert) {
            Button("Cancel", role: .cancel) { }
            Button("Delete", role: .destructive) {
                onDelete()
            }
        } message: {
            Text("This action cannot be undone.")
        }
    }

    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }

    private func formatAttemptValue(_ value: Double) -> String {
        if preset.mode == .time {
            return formatSeconds(value)
        } else {
            return "\(Int(value))"
        }
    }

    private func formatSessionValue(_ value: Double) -> String {
        if preset.mode == .time {
            return formatSeconds(value)
        } else {
            return "\(Int(value))"
        }
    }
}

// Session Stat Metric Component (for 2x2 grid in session cards)
struct SessionStatMetric: View {
    let label: String
    let value: String

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label)
                .font(.system(size: 12))
                .foregroundColor(.gray)

            Text(value)
                .font(.system(size: 16, weight: .semibold))
                .foregroundColor(.white)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(10)
        .background(Color.white.opacity(0.05))
        .cornerRadius(8)
    }
}
