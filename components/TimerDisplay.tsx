import React from "react";
import { View, Text, StyleSheet } from "react-native";

const COLORS = {
  primary: "#6366f1",
  primaryDark: "#4f46e5",
  success: "#10b981",
  danger: "#ef4444",
  warning: "#f59e0b",
  background: "#f9fafb",
  surface: "#ffffff",
  border: "#e5e7eb",
  text: "#1f2937",
  textSecondary: "#6b7280",
  gradient1: "#6366f1",
  gradient2: "#8b5cf6",
};

interface TimerDisplayProps {
  seconds: number;
  initialSeconds: number;
  running: boolean;
  durationMinutes: number;
}

export default function TimerDisplay({
  seconds,
  initialSeconds,
  running,
  durationMinutes,
}: TimerDisplayProps) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const progress =
    initialSeconds > 0 ? (initialSeconds - seconds) / initialSeconds : 0;

  return (
    <View style={styles.timerCard}>
      <View style={styles.timerContent}>
        <Text style={styles.timerLabel}>Time Remaining</Text>
        <Text style={styles.timer}>
          {String(minutes).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </Text>
        <Text style={styles.secondsDisplay}>
          {running
            ? `${Math.floor((initialSeconds - seconds) / 60)}m ${
                (initialSeconds - seconds) % 60
              }s elapsed`
            : `${durationMinutes} minutes session`}
        </Text>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  timerCard: {
    backgroundColor: `${COLORS.primary}15`,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    borderRadius: 16,
    padding: 24,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: `${COLORS.primary}30`,
  },
  timerContent: {
    alignItems: "center",
    marginBottom: 16,
  },
  timerLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  timer: {
    fontSize: 72,
    fontWeight: "800",
    color: COLORS.primary,
    fontVariant: ["tabular-nums"],
  },
  secondsDisplay: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
    fontWeight: "500",
  },
  progressBar: {
    height: 6,
    backgroundColor: `${COLORS.primary}20`,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
  },
});
