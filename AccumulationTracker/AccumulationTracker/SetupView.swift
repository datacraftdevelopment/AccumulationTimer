//
//  SetupView.swift
//  AccumulationTracker
//
//  Setup screen for configuring training session
//

import SwiftUI

struct SetupView: View {
    @Binding var config: TrainingConfig?
    @Binding var appState: AppState
    @Binding var selectedPreset: Preset?
    @ObservedObject var presetManager: PresetManager

    @State private var mode: TrainingMode = .time
    @State private var targetText: String = "60"
    @State private var restTimeText: String = "15"
    @State private var adjustmentText: String = "5"
    @State private var showAbout = false
    @State private var showPresetList = false
    @State private var localSelectedPreset: Preset?

    var body: some View {
        ZStack {
            Color.setupBackground
                .ignoresSafeArea()

            VStack(spacing: 0) {
                // Header
                VStack(spacing: 8) {
                    HStack {
                        Button(action: { showAbout = true }) {
                            Image(systemName: "info.circle")
                                .font(.system(size: 24))
                                .foregroundColor(.gray)
                        }
                        Spacer()
                        VStack {
                            Text("Accumulation Timer")
                                .font(.system(size: 28, weight: .bold))
                                .foregroundColor(.white)
                            Text("Configure your training session")
                                .font(.system(size: 14))
                                .foregroundColor(.gray)
                        }
                        Spacer()
                        Button(action: { showPresetList = true }) {
                            Image(systemName: "star.circle.fill")
                                .font(.system(size: 24))
                                .foregroundColor(.yellow)
                        }
                    }
                    .padding(.horizontal)
                    .padding(.top, 40)
                    .padding(.bottom, 20)
                }

                // Preset Badge (if selected)
                if let preset = localSelectedPreset {
                    HStack {
                        Label(preset.name, systemImage: "star.fill")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(.white)

                        Spacer()

                        Button(action: {
                            localSelectedPreset = nil
                            resetToDefaults()
                        }) {
                            Image(systemName: "xmark.circle.fill")
                                .foregroundColor(.gray)
                        }
                    }
                    .padding(12)
                    .background(Color.yellow.opacity(0.2))
                    .cornerRadius(12)
                    .padding(.horizontal)
                    .padding(.bottom, 8)
                }

                // Card Container
                ScrollView {
                    VStack(spacing: 24) {
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
                                ? "Transition time subtracted from each hold (e.g., 10s hold - 5s = 5s counted)"
                                : "Bonus reps added when you complete a set")
                                .font(.system(size: 12))
                                .foregroundColor(.gray)
                        }
                    }
                    .padding(24)
                    .background(Color.gray.opacity(0.2))
                    .cornerRadius(24)
                    .padding()
                }

                // Start Button
                Button(action: handleStart) {
                    HStack {
                        Image(systemName: "play.fill")
                            .font(.system(size: 24))
                        Text("Start Training")
                            .font(.system(size: 24, weight: .bold))
                    }
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 24)
                    .background(Color.green)
                    .cornerRadius(16)
                }
                .padding()
            }
        }
        .sheet(isPresented: $showAbout) {
            AboutView()
        }
        .sheet(isPresented: $showPresetList) {
            PresetListView(
                presetManager: presetManager,
                selectedPreset: $localSelectedPreset,
                appState: $appState
            )
        }
        .onChange(of: localSelectedPreset) { oldValue, newValue in
            if let preset = newValue {
                loadPreset(preset)
            }
        }
        .onAppear {
            if let preset = selectedPreset {
                localSelectedPreset = preset
                loadPreset(preset)
            }
        }
    }

    private func loadPreset(_ preset: Preset) {
        mode = preset.mode
        targetText = String(Int(preset.target))
        restTimeText = String(preset.restTime)
        adjustmentText = String(Int(preset.adjustment))
    }

    private func resetToDefaults() {
        mode = .time
        targetText = "60"
        restTimeText = "15"
        adjustmentText = "5"
    }

    private func updateDefaults(for mode: TrainingMode) {
        if mode == .time {
            targetText = "60"
            adjustmentText = "5"
        } else {
            targetText = "20"
            adjustmentText = "2"
        }
    }

    private func handleStart() {
        guard let target = Double(targetText), target >= 1,
              let restTime = Int(restTimeText), restTime >= 0,
              let adjustment = Double(adjustmentText), adjustment >= 0 else {
            return
        }

        config = TrainingConfig(
            mode: mode,
            target: target,
            restTime: restTime,
            adjustment: adjustment
        )
        selectedPreset = localSelectedPreset
        appState = .training
    }
}

// About View
struct AboutView: View {
    @Environment(\.dismiss) var dismiss

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    Text("Accumulation Timer")
                        .font(.title)
                        .fontWeight(.bold)

                    Text("A training tool for accumulation training (cluster sets/rest-pause training).")
                        .font(.body)

                    VStack(alignment: .leading, spacing: 12) {
                        Text("Time Mode")
                            .font(.headline)
                        Text("Hold as long as possible. Press 'Bail Out' when you can't continue. Your hold time minus adjustment counts toward your target.")

                        Text("Reps Mode")
                            .font(.headline)
                        Text("Perform your exercise and enter the reps completed. Your reps plus adjustment counts toward your target.")

                        Text("Adjustment")
                            .font(.headline)
                        Text("• Time Mode: Transition time subtracted from holds\n• Reps Mode: Bonus reps added per set")
                    }
                }
                .padding()
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }
}
