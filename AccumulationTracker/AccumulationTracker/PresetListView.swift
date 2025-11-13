//
//  PresetListView.swift
//  AccumulationTracker
//
//  List of presets with create/edit/delete functionality
//

import SwiftUI

struct PresetListView: View {
    @ObservedObject var presetManager: PresetManager
    @Binding var selectedPreset: Preset?
    @Binding var appState: AppState
    @Environment(\.dismiss) var dismiss

    @State private var showingEditView = false
    @State private var editingPreset: Preset?
    @State private var showingHistory = false
    @State private var historyPreset: Preset?

    var body: some View {
        NavigationView {
            ZStack {
                Color.setupBackground
                    .ignoresSafeArea()

                VStack(spacing: 0) {
                    if presetManager.presets.isEmpty {
                        // Empty state
                        VStack(spacing: 20) {
                            Image(systemName: "star.circle")
                                .font(.system(size: 60))
                                .foregroundColor(.gray)

                            Text("No Presets Yet")
                                .font(.title2)
                                .fontWeight(.bold)
                                .foregroundColor(.white)

                            Text("Create your first preset to get started")
                                .font(.body)
                                .foregroundColor(.gray)
                                .multilineTextAlignment(.center)
                                .padding(.horizontal)

                            Button(action: { showingEditView = true }) {
                                Label("Create Preset", systemImage: "plus.circle.fill")
                                    .font(.headline)
                                    .foregroundColor(.white)
                                    .padding()
                                    .background(Color.green)
                                    .cornerRadius(12)
                            }
                        }
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                    } else {
                        // Preset list
                        ScrollView {
                            VStack(spacing: 12) {
                                ForEach(presetManager.presets) { preset in
                                    PresetCard(
                                        preset: preset,
                                        stats: presetManager.getStats(for: preset.id),
                                        onSelect: {
                                            selectedPreset = preset
                                            dismiss()
                                        },
                                        onEdit: {
                                            editingPreset = preset
                                            showingEditView = true
                                        },
                                        onHistory: {
                                            historyPreset = preset
                                            showingHistory = true
                                        },
                                        onDelete: {
                                            presetManager.deletePreset(preset)
                                        }
                                    )
                                }
                            }
                            .padding()
                        }
                    }
                }
            }
            .navigationTitle("Presets")
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(.visible, for: .navigationBar)
            .toolbarBackground(Color.black, for: .navigationBar)
            .toolbarColorScheme(.dark, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                    .foregroundColor(.white)
                }

                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: {
                        editingPreset = nil
                        showingEditView = true
                    }) {
                        Image(systemName: "plus")
                            .foregroundColor(.white)
                    }
                }
            }
            .sheet(isPresented: $showingEditView) {
                PresetEditView(
                    presetManager: presetManager,
                    preset: editingPreset
                )
            }
            .sheet(isPresented: $showingHistory) {
                if let preset = historyPreset {
                    HistoryView(
                        preset: preset,
                        presetManager: presetManager
                    )
                }
            }
        }
    }
}

// Preset Card Component
struct PresetCard: View {
    let preset: Preset
    let stats: PresetStats?
    let onSelect: () -> Void
    let onEdit: () -> Void
    let onHistory: () -> Void
    let onDelete: () -> Void

    @State private var showDeleteAlert = false

    var body: some View {
        VStack(spacing: 0) {
            // Main content - tappable to select
            Button(action: onSelect) {
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(preset.name)
                                .font(.system(size: 20, weight: .bold))
                                .foregroundColor(.white)

                            HStack(spacing: 12) {
                                Label(preset.mode == .time ? "\(Int(preset.target))s" : "\(Int(preset.target)) reps",
                                      systemImage: preset.mode == .time ? "timer" : "number")
                                    .font(.system(size: 14))
                                    .foregroundColor(.gray)

                                Label("\(preset.restTime)s rest",
                                      systemImage: "pause.circle")
                                    .font(.system(size: 14))
                                    .foregroundColor(.gray)
                            }
                        }

                        Spacer()

                        if let stats = stats {
                            VStack(alignment: .trailing, spacing: 4) {
                                Text("\(stats.totalSessions)")
                                    .font(.system(size: 24, weight: .bold))
                                    .foregroundColor(.white)

                                Text("sessions")
                                    .font(.system(size: 12))
                                    .foregroundColor(.gray)
                            }
                        }
                    }

                    // Stats row if available
                    if let stats = stats {
                        HStack(spacing: 16) {
                            StatBadge(
                                label: "Avg",
                                value: formatTime(stats.averageDuration),
                                trend: stats.trend
                            )

                            StatBadge(
                                label: "Best",
                                value: formatTime(stats.bestDuration),
                                trend: nil
                            )

                            StatBadge(
                                label: "Attempts",
                                value: String(format: "%.1f", stats.averageAttempts),
                                trend: nil
                            )
                        }
                    }
                }
                .padding(16)
            }

            // Action buttons
            HStack(spacing: 0) {
                Button(action: onHistory) {
                    Label("History", systemImage: "chart.line.uptrend.xyaxis")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.white.opacity(0.8))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                }

                Divider()
                    .background(Color.white.opacity(0.2))

                Button(action: onEdit) {
                    Label("Edit", systemImage: "pencil")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.white.opacity(0.8))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                }

                Divider()
                    .background(Color.white.opacity(0.2))

                Button(action: { showDeleteAlert = true }) {
                    Label("Delete", systemImage: "trash")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.red.opacity(0.8))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                }
            }
            .background(Color.white.opacity(0.05))
        }
        .background(Color.gray.opacity(0.2))
        .cornerRadius(16)
        .alert("Delete Preset?", isPresented: $showDeleteAlert) {
            Button("Cancel", role: .cancel) { }
            Button("Delete", role: .destructive) {
                onDelete()
            }
        } message: {
            Text("This will delete the preset and all its history.")
        }
    }
}

// Stat Badge Component
struct StatBadge: View {
    let label: String
    let value: String
    let trend: TrendDirection?

    var body: some View {
        VStack(spacing: 4) {
            HStack(spacing: 4) {
                Text(value)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(.white)

                if let trend = trend {
                    Image(systemName: trendIcon(trend))
                        .font(.system(size: 12))
                        .foregroundColor(trendColor(trend))
                }
            }

            Text(label)
                .font(.system(size: 10))
                .foregroundColor(.gray)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(Color.white.opacity(0.1))
        .cornerRadius(8)
    }

    private func trendIcon(_ trend: TrendDirection) -> String {
        switch trend {
        case .improving: return "arrow.down.circle.fill"
        case .declining: return "arrow.up.circle.fill"
        case .stable: return "arrow.left.arrow.right.circle.fill"
        }
    }

    private func trendColor(_ trend: TrendDirection) -> Color {
        switch trend {
        case .improving: return .green
        case .declining: return .red
        case .stable: return .gray
        }
    }
}
