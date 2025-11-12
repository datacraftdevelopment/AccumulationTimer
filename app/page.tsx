"use client";

import { useState, useEffect, useRef } from "react";
import SetupScreen, { type TrainingMode } from "@/components/SetupScreen";
import TimeTrainingScreen from "@/components/TimeTrainingScreen";
import RepsTrainingScreen from "@/components/RepsTrainingScreen";
import RestScreen from "@/components/RestScreen";
import CompletionScreen from "@/components/CompletionScreen";
import type { Attempt } from "@/components/TimeTrainingScreen";

type AppState = "setup" | "training" | "resting" | "complete";

interface TrainingConfig {
  mode: TrainingMode;
  target: number;
  restTime: number;
  bonus: number;
}

export default function Home() {
  const [appState, setAppState] = useState<AppState>("setup");
  const [config, setConfig] = useState<TrainingConfig | null>(null);
  const [totalAccumulated, setTotalAccumulated] = useState(0);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [restCountdown, setRestCountdown] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState(0);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // WakeLock: Prevent screen from sleeping during training
  useEffect(() => {
    const requestWakeLock = async () => {
      if ("wakeLock" in navigator && appState !== "setup" && appState !== "complete") {
        try {
          wakeLockRef.current = await navigator.wakeLock.request("screen");
        } catch (err) {
          // WakeLock failed - not critical, continue without it
          console.log("WakeLock failed:", err);
        }
      }
    };

    const releaseWakeLock = async () => {
      if (wakeLockRef.current) {
        try {
          await wakeLockRef.current.release();
          wakeLockRef.current = null;
        } catch (err) {
          console.log("WakeLock release failed:", err);
        }
      }
    };

    if (appState === "training" || appState === "resting") {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    return () => {
      releaseWakeLock();
    };
  }, [appState]);

  // Page Visibility: Pause on background (for future enhancement)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // App backgrounded - timers already handle this in their components
        console.log("App backgrounded");
      } else {
        // App foregrounded
        console.log("App foregrounded");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const handleStart = (trainingConfig: TrainingConfig) => {
    setConfig(trainingConfig);
    setTotalAccumulated(0);
    setAttempts([]);
    setSessionStartTime(Date.now());
    setAppState("training");
  };

  const handleBailOut = (currentValue: number) => {
    if (!config) return;

    // Subtraction model: holdTime - adjustment = time that counts toward goal
    // Adjustment represents transition time that doesn't count
    const timeSubtracted = Math.max(0, currentValue - config.bonus);
    const newTotal = totalAccumulated + timeSubtracted;

    setAttempts([
      ...attempts,
      {
        value: currentValue,
        bonus: config.bonus,
        total: timeSubtracted,
        timestamp: Date.now(),
      },
    ]);
    setTotalAccumulated(newTotal);

    // Check if target reached
    if (newTotal >= config.target) {
      setAppState("complete");
    } else {
      // Start rest period
      setRestCountdown(config.restTime);
      setAppState("resting");
    }
  };

  const handleStop = (currentValue: number) => {
    if (!config) return;

    // Stop without adjustment - full time counts
    const newTotal = totalAccumulated + currentValue;

    setAttempts([
      ...attempts,
      {
        value: currentValue,
        bonus: 0, // No adjustment applied for stop
        total: currentValue,
        timestamp: Date.now(),
      },
    ]);
    setTotalAccumulated(newTotal);

    // Always go to complete when stopping
    setAppState("complete");
  };

  const handleDoneWithSet = (reps: number) => {
    if (!config) return;

    const totalAdded = reps + config.bonus;
    const newTotal = totalAccumulated + totalAdded;

    setAttempts([
      ...attempts,
      {
        value: reps,
        bonus: config.bonus,
        total: totalAdded,
        timestamp: Date.now(),
      },
    ]);
    setTotalAccumulated(newTotal);

    // Check if target reached
    if (newTotal >= config.target) {
      setAppState("complete");
    } else {
      // Start rest period
      setRestCountdown(config.restTime);
      setAppState("resting");
    }
  };

  const handleCountdownTick = () => {
    setRestCountdown((prev) => Math.max(0, prev - 1));
  };

  const handleRestComplete = () => {
    setAppState("training");
  };

  const handleSkipRest = () => {
    setAppState("training");
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset? All progress will be lost.")) {
      setAppState("setup");
      setConfig(null);
      setTotalAccumulated(0);
      setAttempts([]);
      setRestCountdown(0);
      setSessionStartTime(0);
    }
  };

  const handleNewSession = () => {
    setAppState("setup");
    setConfig(null);
    setTotalAccumulated(0);
    setAttempts([]);
    setRestCountdown(0);
    setSessionStartTime(0);
  };

  const sessionDuration = sessionStartTime
    ? Math.floor((Date.now() - sessionStartTime) / 1000)
    : 0;

  return (
    <main className="min-h-screen">
      {appState === "setup" && <SetupScreen onStart={handleStart} />}

      {appState === "training" && config && (
        <>
          {config.mode === "time" ? (
            <TimeTrainingScreen
              target={config.target}
              bonus={config.bonus}
              totalAccumulated={totalAccumulated}
              attempts={attempts}
              onBailOut={handleBailOut}
              onStop={handleStop}
              onReset={handleReset}
            />
          ) : (
            <RepsTrainingScreen
              target={config.target}
              bonus={config.bonus}
              totalAccumulated={totalAccumulated}
              attempts={attempts}
              onDoneWithSet={handleDoneWithSet}
              onReset={handleReset}
            />
          )}
        </>
      )}

      {appState === "resting" && config && (
        <RestScreen
          mode={config.mode}
          restCountdown={restCountdown}
          target={config.target}
          totalAccumulated={totalAccumulated}
          onCountdownTick={handleCountdownTick}
          onRestComplete={handleRestComplete}
          onSkipRest={handleSkipRest}
        />
      )}

      {appState === "complete" && config && (
        <CompletionScreen
          mode={config.mode}
          totalAccumulated={totalAccumulated}
          target={config.target}
          attempts={attempts}
          sessionDuration={sessionDuration}
          onNewSession={handleNewSession}
        />
      )}
    </main>
  );
}
