import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  TextInput,
  AppState,
  ScrollView,
} from "react-native";
import { saveSession } from "../database/db";
import TimerDisplay from "../../components/TimerDisplay";
import DistractionCounter from "../../components/DistractionCounter";
import CategoryPicker from "../../components/CategoryPicker";
import {
  registerForPushNotificationsAsync,
  scheduleSessionEndNotification,
  scheduleBackgroundNotification,
} from "../../services/notifications";

type Category = string;

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
    // Register for push notifications
    registerForPushNotificationsAsync();

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appStateRef.current === "active" &&
        nextAppState === "background" &&
        running
      ) {
        setWasRunning(true);
        pauseTimer();
        setDistractions((prev) => prev + 1);
        // Schedule background notification
        scheduleBackgroundNotification();
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

    if (seconds > 0 && seconds < initialSeconds) {
      // Resuming from pause, do not reset seconds
    } else {
      // Fresh start or after reset/finish
      const initSec = durationMinutes * 60;
      setInitialSeconds(initSec);
      setSeconds(initSec);
    }

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
  }, [running, durationMinutes, seconds, initialSeconds]);

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

      // Schedule session end notification
      await scheduleSessionEndNotification();

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

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 40,
      }}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Focus Timer</Text>
        <Text style={styles.headerSubtitle}>Stay focused</Text>
      </View>

      <TimerDisplay
        seconds={seconds}
        initialSeconds={initialSeconds}
        running={running}
        durationMinutes={durationMinutes}
      />

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

      <CategoryPicker
        category={category}
        setCategory={setCategory}
        running={running}
      />

      <DistractionCounter
        distractions={distractions}
        setDistractions={setDistractions}
        running={running}
      />

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.buttonStart,
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
          {running ? "⏱️  Timer is running..." : " Ready to focus"}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
