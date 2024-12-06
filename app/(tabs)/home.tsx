import React, { useState, useRef, useCallback } from "react";
import { View, Text, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { saveSession } from "../database/db";

const CATEGORIES = [
  { label: "Study", value: "Study" },
  { label: "Work", value: "Work" },
  { label: "Sport", value: "Sport" },
  { label: "Other", value: "Other" },
] as const;

type Category = (typeof CATEGORIES)[number]["value"];

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

export default function Home() {
  const [seconds, setSeconds] = useState<number>(0);
  const [running, setRunning] = useState<boolean>(false);
  const [category, setCategory] = useState<Category>("Study");
  const [distractions, setDistractions] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback(() => {
    if (running) return;

    setRunning(true);
    intervalRef.current = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000) as unknown as NodeJS.Timeout;
  }, [running]);

  const stopTimer = useCallback(async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setIsLoading(true);

    try {
      const date = new Date().toISOString().split("T")[0];
      await saveSession(seconds, category, distractions, date);

      Alert.alert(
        "✓ Session Saved",
        `${Math.floor(seconds / 60)}m ${
          seconds % 60
        }s focus session in ${category} category`
      );
      setSeconds(0);
      setDistractions(0);
    } catch (error) {
      Alert.alert("✕ Error", "Failed to save session. Please try again.");
      console.error("Save session error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [seconds, category, distractions]);

  const resetTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSeconds(0);
    setDistractions(0);
    setRunning(false);
  }, []);

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const progress = (seconds % 60) / 60;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Focus Timer</Text>
        <Text style={styles.headerSubtitle}>Stay focused, achieve more</Text>
      </View>

      <View style={styles.timerCard}>
        <View style={styles.timerContent}>
          <Text style={styles.timerLabel}>Session Time</Text>
          <Text style={styles.timer}>
            {String(minutes).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </Text>
          <Text style={styles.secondsDisplay}>{seconds} seconds elapsed</Text>
        </View>

        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${progress * 100}%` }]}
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Focus Category</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={category}
            onValueChange={(value) => setCategory(value as Category)}
            style={styles.picker}
          >
            {CATEGORIES.map((cat) => (
              <Picker.Item
                key={cat.value}
                label={`📌 ${cat.label}`}
                value={cat.value}
              />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Distractions Counted</Text>
        <View style={styles.distractionsBox}>
          <TouchableOpacity
            style={[styles.counterButton, styles.decreaseBtn]}
            onPress={() => setDistractions(Math.max(0, distractions - 1))}
            disabled={running || distractions === 0}
          >
            <Text style={styles.counterButtonText}>−</Text>
          </TouchableOpacity>

          <View style={styles.distractionsDisplay}>
            <Text style={styles.distractionsValue}>{distractions}</Text>
            <Text style={styles.distractionsLabel}>times</Text>
          </View>

          <TouchableOpacity
            style={[styles.counterButton, styles.increaseBtn]}
            onPress={() => setDistractions(distractions + 1)}
            disabled={running}
          >
            <Text style={styles.counterButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[
            styles.button,
            running ? styles.buttonStop : styles.buttonStart,
            isLoading && styles.buttonDisabled,
          ]}
          onPress={running ? stopTimer : startTimer}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {running ? "⏸ Pause Session" : "▶ Start Focus"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonReset]}
          onPress={resetTimer}
          disabled={seconds === 0}
        >
          <Text style={styles.buttonText}>↻ Reset</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {running ? "⏱️  Timer is running..." : "📍 Ready to focus"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  header: {
    marginBottom: 28,
    marginTop: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  timerCard: {
    backgroundColor: `${COLORS.primary}15`,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
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
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  pickerContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  picker: {
    height: 50,
    color: COLORS.text,
  },
  distractionsBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 12,
  },
  counterButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "bold",
  },
  decreaseBtn: {
    backgroundColor: `${COLORS.danger}15`,
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  increaseBtn: {
    backgroundColor: `${COLORS.success}15`,
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  counterButtonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
  },
  distractionsDisplay: {
    alignItems: "center",
    flex: 1,
  },
  distractionsValue: {
    fontSize: 40,
    fontWeight: "800",
    color: COLORS.primary,
  },
  distractionsLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontWeight: "500",
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "bold",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  buttonStart: {
    backgroundColor: COLORS.success,
  },
  buttonStop: {
    backgroundColor: COLORS.danger,
  },
  buttonReset: {
    backgroundColor: COLORS.warning,
    flex: 0.4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.surface,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
});
