//
//  CompletionView.swift
//  AccumulationTracker
//
//  Completion screen showing session summary and attempt history
//

import SwiftUI

struct CompletionView: View {
    let mode: TrainingMode
    let target: Double
    let totalAccumulated: Double
    let attempts: [Attempt]
    let sessionDuration: Int

    let onNewSession: () -> Void

    var body: some View {
        ZStack {
            Color.complete
                .ignoresSafeArea()

            ScrollView {
                VStack(spacing: 20) {
                    // Celebration Header
                    VStack(spacing: 8) {
                        Image(systemName: "trophy.fill")
                            .font(.system(size: 60))
                            .foregroundColor(.yellow)
                            .padding(.top, 40)

                        Text("Goal Complete!")
                            .font(.system(size: 40, weight: .bold))
                            .foregroundColor(.white)

                        Text("Great work!")
                            .font(.system(size: 16))
                            .foregroundColor(.white.opacity(0.8))
                    }
                    .padding(.bottom, 20)

                    // Session Summary Card
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Session Summary")
                            .font(.system(size: 20, weight: .semibold))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity, alignment: .center)

                        VStack(spacing: 8) {
                            SummaryRow(
                                label: "Total:",
                                value: formatValue(totalAccumulated),
                                isLarge: true
                            )

                            SummaryRow(
                                label: "Target:",
                                value: formatValue(target),
                                isLarge: false
                            )

                            SummaryRow(
                                label: "Attempts:",
                                value: "\(attempts.count)",
                                isLarge: false
                            )

                            SummaryRow(
                                label: "Duration:",
                                value: formatTime(sessionDuration),
                                isLarge: false
                            )
                        }
                    }
                    .padding(24)
                    .background(Color.white.opacity(0.1))
                    .cornerRadius(24)
                    .padding(.horizontal)

                    // Attempt History
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Attempt History")
                            .font(.system(size: 18, weight: .semibold))
                            .foregroundColor(.white)
                            .padding(.horizontal)

                        VStack(spacing: 0) {
                            // Header Row
                            HStack {
                                Text("#")
                                    .font(.system(size: 14, weight: .semibold))
                                    .foregroundColor(.white)
                                    .frame(width: 40, alignment: .leading)

                                Text(mode == .time ? "Hold" : "Reps")
                                    .font(.system(size: 14, weight: .semibold))
                                    .foregroundColor(.white)
                                    .frame(maxWidth: .infinity, alignment: .trailing)

                                Text(mode == .time ? "Adj." : "Bonus")
                                    .font(.system(size: 14, weight: .semibold))
                                    .foregroundColor(.white)
                                    .frame(maxWidth: .infinity, alignment: .trailing)

                                Text("Counted")
                                    .font(.system(size: 14, weight: .semibold))
                                    .foregroundColor(.white)
                                    .frame(maxWidth: .infinity, alignment: .trailing)
                            }
                            .padding(.vertical, 8)
                            .padding(.horizontal, 16)
                            .background(Color.white.opacity(0.1))

                            // Attempt Rows
                            ForEach(Array(attempts.enumerated()), id: \.element.id) { index, attempt in
                                HStack {
                                    Text("\(index + 1)")
                                        .font(.system(size: 14, weight: .semibold))
                                        .foregroundColor(.white)
                                        .frame(width: 40, alignment: .leading)

                                    Text(formatAttemptValue(attempt.value))
                                        .font(.system(size: 14))
                                        .foregroundColor(.white)
                                        .frame(maxWidth: .infinity, alignment: .trailing)

                                    Text(formatAttemptValue(attempt.adjustment))
                                        .font(.system(size: 14))
                                        .foregroundColor(.white)
                                        .frame(maxWidth: .infinity, alignment: .trailing)

                                    Text(formatAttemptValue(attempt.total))
                                        .font(.system(size: 14, weight: .bold))
                                        .foregroundColor(.white)
                                        .frame(maxWidth: .infinity, alignment: .trailing)
                                }
                                .padding(.vertical, 8)
                                .padding(.horizontal, 16)
                                .background(index % 2 == 0 ? Color.clear : Color.white.opacity(0.05))
                            }
                        }
                        .background(Color.white.opacity(0.1))
                        .cornerRadius(16)
                        .padding(.horizontal)
                    }

                    // New Session Button
                    Button(action: onNewSession) {
                        HStack {
                            Image(systemName: "arrow.counterclockwise")
                                .font(.system(size: 24))
                            Text("New Session")
                                .font(.system(size: 24, weight: .bold))
                        }
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 24)
                        .background(Color.green)
                        .cornerRadius(16)
                    }
                    .padding()
                    .padding(.bottom, 20)
                }
            }
        }
    }

    private func formatValue(_ value: Double) -> String {
        if mode == .time {
            return formatSeconds(value)
        } else {
            return "\(Int(value)) \(Int(value) == 1 ? "rep" : "reps")"
        }
    }

    private func formatAttemptValue(_ value: Double) -> String {
        if mode == .time {
            return formatSeconds(value)
        } else {
            return "\(Int(value))"
        }
    }
}

// Summary Row Component
struct SummaryRow: View {
    let label: String
    let value: String
    let isLarge: Bool

    var body: some View {
        HStack {
            Text(label)
                .font(.system(size: isLarge ? 16 : 14))
                .foregroundColor(.white.opacity(0.8))

            Spacer()

            Text(value)
                .font(.system(size: isLarge ? 20 : 14, weight: isLarge ? .bold : .semibold))
                .foregroundColor(.white)
        }
    }
}
