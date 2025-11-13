//
//  RestView.swift
//  AccumulationTracker
//
//  Rest countdown screen with audio and haptic feedback
//

import SwiftUI
import AudioToolbox

struct RestView: View {
    let mode: TrainingMode
    let target: Double
    let totalAccumulated: Double

    @Binding var restCountdown: Int
    let onRestComplete: () -> Void
    let onSkipRest: () -> Void

    let timer = Timer.publish(every: 1.0, on: .main, in: .common).autoconnect()

    var body: some View {
        ZStack {
            Color.resting
                .ignoresSafeArea()

            VStack(spacing: 0) {
                // REST Header
                Text("REST")
                    .font(.system(size: 40, weight: .bold))
                    .foregroundColor(.white)
                    .padding(.top, 60)
                    .padding(.bottom, 20)

                Spacer()

                // Countdown Timer
                VStack(spacing: 16) {
                    Text(formatCountdown(restCountdown))
                        .font(.system(size: 120, weight: .bold))
                        .foregroundColor(.white)
                        .monospacedDigit()

                    Text("Next set starts in...")
                        .font(.system(size: 24, weight: .medium))
                        .foregroundColor(.white.opacity(0.8))
                }

                Spacer()

                // Progress Section
                VStack(spacing: 12) {
                    HStack {
                        Text("Accumulated: \(formatValue(totalAccumulated))")
                            .font(.system(size: 18))
                            .foregroundColor(.white)
                        Spacer()
                        Text("Target: \(formatValue(target))")
                            .font(.system(size: 18))
                            .foregroundColor(.white)
                    }

                    // Progress Bar
                    GeometryReader { geometry in
                        ZStack(alignment: .leading) {
                            Rectangle()
                                .fill(Color.white.opacity(0.2))
                                .frame(height: 16)
                                .cornerRadius(8)

                            Rectangle()
                                .fill(Color.white)
                                .frame(width: geometry.size.width * CGFloat(min(progressPercent / 100, 1.0)), height: 16)
                                .cornerRadius(8)
                        }
                    }
                    .frame(height: 16)

                    Text("Remaining: \(formatValue(remaining))")
                        .font(.system(size: 16))
                        .foregroundColor(.white)
                }
                .padding(20)
                .background(Color.white.opacity(0.1))
                .cornerRadius(20)
                .padding()

                // Skip Rest Button
                Button(action: onSkipRest) {
                    Text("Skip Rest")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .background(Color.white.opacity(0.2))
                        .cornerRadius(12)
                }
                .padding()
                .padding(.bottom, 20)
            }
        }
        .onReceive(timer) { _ in
            if restCountdown > 0 {
                // Play warning beep at 3 seconds
                if restCountdown == 3 {
                    playWarningBeep()
                }
                restCountdown -= 1
            } else {
                // Play completion beep and auto-transition
                playCompletionBeep()
                onRestComplete()
            }
        }
    }

    private var progressPercent: Double {
        min(100, (totalAccumulated / target) * 100)
    }

    private var remaining: Double {
        max(0, target - totalAccumulated)
    }

    private func formatValue(_ value: Double) -> String {
        if mode == .time {
            return formatSeconds(value)
        } else {
            return "\(Int(value)) \(Int(value) == 1 ? "rep" : "reps")"
        }
    }

    private func playWarningBeep() {
        // Play system sound for warning
        AudioServicesPlaySystemSound(1054)
        // Haptic feedback
        let generator = UINotificationFeedbackGenerator()
        generator.notificationOccurred(.warning)
    }

    private func playCompletionBeep() {
        // Play system sound for completion
        AudioServicesPlaySystemSound(1057)
        // Haptic feedback
        let generator = UINotificationFeedbackGenerator()
        generator.notificationOccurred(.success)
    }
}
