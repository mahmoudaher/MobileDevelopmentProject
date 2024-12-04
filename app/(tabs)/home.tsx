import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  TextInput,
  AppState,
} from "react-native";
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
  const [seconds, setSeconds] = useState<number>(25 * 60);
  const [running, setRunning] = useState<boolean>(false);
  const [category, setCategory] = useState<Category>("Study");
  const [distractions, setDistractions] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [durationMinutes, setDurationMinutes] = useState<number>(25);
  const [initialSeconds, setInitialSeconds] = useState<number>(25 * 60);
  const [wasRunning, setWasRunning] = useState<boolean>(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appStateRef.current === "active" &&
        nextAppState === "background" &&
        running
      ) {
        setWasRunning(true);
        pauseTimer();
        setDistractions((prev) => prev + 1);
      } else if (
        appStateRef.current === "background" &&
        nextAppState === "active" &&
        wasRunning
      ) {
        setWasRunning(false);
        Alert.alert(
          "Resume Session?",
          "You left the app and a distraction was counted. Resume the timer?",
          [
            { text: "No", style: "cancel" },
            { text: "Yes", onPress: startTimer },
          ]
        );
      }
      appStateRef.current = nextAppState;
    });

    return () => subscription?.remove();
  }, [running, wasRunning]);

  const startTimer = useCallback(() => {
    if (running) return;

    const initSec = durationMinutes * 60;
    setInitialSeconds(initSec);
    setSeconds(initSec);
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current!);
          setRunning(false);
          handleSessionEnd();
          return 0;
        }
        return s - 1;
      });
    }, 1000) as unknown as NodeJS.Timeout;
  }, [running, durationMinutes]);

  const pauseTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
  }, []);

  const stopTimer = useCallback(async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setIsLoading(true);

    try {
      const elapsed = initialSeconds - seconds;
      const date = new Date().toISOString().split("T")[0];
      await saveSession(elapsed, category, distractions, date);

      Alert.alert(
        "✓ Session Saved",
        `Focused for ${Math.floor(elapsed / 60)}m ${
          elapsed % 60
        }s in ${category} category with ${distractions} distractions`
      );
      setSeconds(initialSeconds);
      setDistractions(0);
    } catch (error) {
      Alert.alert("✕ Error", "Failed to save session. Please try again.");
      console.error("Save session error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [initialSeconds, seconds, category, distractions]);

  const resetTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSeconds(initialSeconds);
    setDistractions(0);
    setRunning(false);
  }, [initialSeconds]);

  const handleSessionEnd = useCallback(async () => {
    setIsLoading(true);
    try {
      const elapsed = initialSeconds;
      const date = new Date().toISOString().split("T")[0];
      await saveSession(elapsed, category, distractions, date);

      Alert.alert(
        "✓ Session Completed",
        `Focused for ${Math.floor(elapsed / 60)}m ${
          elapsed % 60
        }s in ${category} category with ${distractions} distractions`
      );
      setSeconds(initialSeconds);
      setDistractions(0);
    } catch (error) {
      Alert.alert("✕ Error", "Failed to save session. Please try again.");
      console.error("Save session error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [initialSeconds, category, distractions]);

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const progress =
    initialSeconds > 0 ? (initialSeconds - seconds) / initialSeconds : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Focus Timer</Text>
        <Text style={styles.headerSubtitle}>Stay focused, achieve more</Text>
      </View>

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
          <View
            style={[styles.progressFill, { width: `${progress * 100}%` }]}
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Session Duration (minutes)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={durationMinutes.toString()}
          onChangeText={(text) => setDurationMinutes(parseInt(text) || 25)}
          editable={!running}
          placeholder="25"
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Focus Category</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={category}
            onValueChange={(value) => setCategory(value as Category)}
            style={styles.picker}
            enabled={!running}
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
            running ? styles.buttonPause : styles.buttonStart,
            isLoading && styles.buttonDisabled,
          ]}
          onPress={running ? pauseTimer : startTimer}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {running ? "⏸ Pause" : "▶ Start"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonStop]}
          onPress={stopTimer}
          disabled={isLoading || (!running && seconds === initialSeconds)}
        >
          <Text style={styles.buttonText}>⏹ Stop & Save</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonReset]}
          onPress={resetTimer}
          disabled={seconds === initialSeconds && !running}
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
    paddingBottom: 40,
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
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.background,
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
    marginBottom: 24,
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
    flex: 1,
  },
  buttonReset: {
    backgroundColor: COLORS.warning,
    flex: 1,
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
