//
//  PresetEditView.swift
//  AccumulationTracker
//
//  Create or edit a preset
//

import SwiftUI

struct PresetEditView: View {
    @ObservedObject var presetManager: PresetManager
    let preset: Preset?  // nil for new preset

    @Environment(\.dismiss) var dismiss

    @State private var name: String = ""
    @State private var mode: TrainingMode = .time
    @State private var targetText: String = "60"
    @State private var restTimeText: String = "15"
    @State private var adjustmentText: String = "5"

    var isEditing: Bool {
        preset != nil
    }

    var body: some View {
        NavigationView {
            ZStack {
                Color.setupBackground
                    .ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 24) {
                        // Name Input
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Preset Name")
                                .font(.system(size: 16, weight: .medium))
                                .foregroundColor(.white)

                            TextField("e.g., Straight Handstand", text: $name)
                                .font(.system(size: 24, weight: .bold))
                                .foregroundColor(.white)
                                .padding()
                                .background(Color.gray.opacity(0.3))
                                .cornerRadius(12)
                        }

                        // Mode Selection
                        VStack(alignment: .leading, spacing: 16) {
                            Text("Training Mode")
                                .font(.system(size: 18, weight: .semibold))
                                .foregroundColor(.white)

                            HStack(spacing: 16) {
                                ForEach(TrainingMode.allCases, id: \.self) { trainingMode in
                                    Button(action: {
                                        mode = trainingMode
                                        updateDefaults(for: trainingMode)
                                    }) {
                                        Text(trainingMode.rawValue)
                                            .font(.system(size: 18, weight: .semibold))
                                            .foregroundColor(.white)
                                            .frame(maxWidth: .infinity)
                                            .padding(.vertical, 16)
                                            .background(mode == trainingMode ? Color.green : Color.gray.opacity(0.3))
                                            .cornerRadius(12)
                                    }
                                }
                            }
                        }

                        // Target Input
                        VStack(alignment: .leading, spacing: 8) {
                            Text(mode == .time ? "Target Seconds" : "Target Reps")
                                .font(.system(size: 16, weight: .medium))
                                .foregroundColor(.white)

                            TextField("", text: $targetText)
                                .keyboardType(.numberPad)
                                .font(.system(size: 24, weight: .bold))
                                .foregroundColor(.white)
                                .padding()
                                .background(Color.gray.opacity(0.3))
                                .cornerRadius(12)
                        }

                        // Rest Time Input
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Rest Time (seconds)")
                                .font(.system(size: 16, weight: .medium))
                                .foregroundColor(.white)

                            TextField("", text: $restTimeText)
                                .keyboardType(.numberPad)
                                .font(.system(size: 24, weight: .bold))
                                .foregroundColor(.white)
                                .padding()
                                .background(Color.gray.opacity(0.3))
                                .cornerRadius(12)
                        }

                        // Adjustment Input
                        VStack(alignment: .leading, spacing: 8) {
                            Text(mode == .time ? "Adjustment Per Bail (seconds)" : "Adjustment Per Set (reps)")
                                .font(.system(size: 16, weight: .medium))
                                .foregroundColor(.white)

                            TextField("", text: $adjustmentText)
                                .keyboardType(.numberPad)
                                .font(.system(size: 24, weight: .bold))
                                .foregroundColor(.white)
                                .padding()
                                .background(Color.gray.opacity(0.3))
                                .cornerRadius(12)

                            Text(mode == .time
                                ? "Transition time subtracted from each hold"
                                : "Bonus reps added when you complete a set")
                                .font(.system(size: 12))
                                .foregroundColor(.gray)
                        }

                        // Save Button
                        Button(action: savePreset) {
                            Text(isEditing ? "Save Changes" : "Create Preset")
                                .font(.system(size: 20, weight: .bold))
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 20)
                                .background(canSave ? Color.green : Color.gray.opacity(0.5))
                                .cornerRadius(16)
                        }
                        .disabled(!canSave)
                    }
                    .padding()
                }
            }
            .navigationTitle(isEditing ? "Edit Preset" : "New Preset")
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
            }
            .onAppear {
                if let preset = preset {
                    // Load existing preset data
                    name = preset.name
                    mode = preset.mode
                    targetText = String(Int(preset.target))
                    restTimeText = String(preset.restTime)
                    adjustmentText = String(Int(preset.adjustment))
                }
            }
        }
    }

    private var canSave: Bool {
        !name.trimmingCharacters(in: .whitespaces).isEmpty &&
        (Double(targetText) ?? 0) >= 1 &&
        (Int(restTimeText) ?? -1) >= 0 &&
        (Double(adjustmentText) ?? -1) >= 0
    }

    private func updateDefaults(for mode: TrainingMode) {
        // Only update if creating new preset
        guard preset == nil else { return }

        if mode == .time {
            targetText = "60"
            adjustmentText = "5"
        } else {
            targetText = "20"
            adjustmentText = "2"
        }
    }

    private func savePreset() {
        guard let target = Double(targetText),
              let restTime = Int(restTimeText),
              let adjustment = Double(adjustmentText) else {
            return
        }

        let newPreset = Preset(
            id: preset?.id ?? UUID(),
            name: name.trimmingCharacters(in: .whitespaces),
            mode: mode,
            target: target,
            restTime: restTime,
            adjustment: adjustment,
            createdAt: preset?.createdAt ?? Date()
        )

        presetManager.savePreset(newPreset)
        dismiss()
    }
}
