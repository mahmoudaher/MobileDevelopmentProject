import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, AppState } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { saveSession } from "../database/db";

export default function Home() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [category, setCategory] = useState<string>("");

  const [distractions, setDistractions] = useState(0);

  const intervalRef = useRef<number | null>(null);
  const appState = useRef(AppState.currentState);

  const toggleTimer = () => {
    if (category === "") return;
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(25 * 60);
    setDistractions(0);

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  // Timer Logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === 0) {
            if (intervalRef.current) clearInterval(intervalRef.current);

            const duration = 25 * 60;
            const today = new Date().toISOString().split("T")[0];

            saveSession(duration, category, distractions, today);

            return 0;
          }
          return prev - 1;
        });
      }, 1000) as unknown as number;

    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  // Distraction Detection
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (isRunning) {
        if (
          appState.current === "active" &&
          nextState.match(/inactive|background/)
        ) {
          setDistractions((d) => d + 1);
          setIsRunning(false);
        }
      }
      appState.current = nextState;
    });

    return () => subscription.remove();
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? "0" + m : m}:${s < 10 ? "0" + s : s}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Focus Timer</Text>

      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={category}
          onValueChange={(value: string) => setCategory(value)}
          style={styles.picker}
        >
          <Picker.Item label="Select category..." value="" />
          <Picker.Item label="Coding" value="Coding" />
          <Picker.Item label="Studying" value="Studying" />
          <Picker.Item label="Reading" value="Reading" />
          <Picker.Item label="Project" value="Project" />
          <Picker.Item label="Other" value="Other" />
        </Picker>
      </View>

      <Text style={styles.timer}>{formatTime(timeLeft)}</Text>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.btnStart, category === "" ? { opacity: 0.4 } : {}]}
          onPress={toggleTimer}
          disabled={category === ""}
        >
          <Text style={styles.btnText}>{isRunning ? "Pause" : "Start"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnReset} onPress={resetTimer}>
          <Text style={styles.btnText}>Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
  },
  pickerWrapper: {
    width: "80%",
    backgroundColor: "#f1f1f1",
    borderRadius: 10,
    marginBottom: 20,
  },
  picker: {
    width: "100%",
    height: 50,
  },
  timer: {
    fontSize: 60,
    fontWeight: "bold",
    marginBottom: 30,
  },
  buttons: {
    flexDirection: "row",
    gap: 20,
  },
  btnStart: {
    backgroundColor: "#2ecc71",
    padding: 15,
    borderRadius: 10,
    width: 120,
    alignItems: "center",
  },
  btnReset: {
    backgroundColor: "#e74c3c",
    padding: 15,
    borderRadius: 10,
    width: 120,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
