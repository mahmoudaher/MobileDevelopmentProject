import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function Home() {
  const [timeLeft, setTimeLeft] = useState(25 * 60); 
  const [isRunning, setIsRunning] = useState(false);

  const intervalRef = useRef<number | null>(null);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(25 * 60);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === 0) {
            if (intervalRef.current) clearInterval(intervalRef.current);
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

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? "0" + m : m}:${s < 10 ? "0" + s : s}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Focus Timer</Text>

      <Text style={styles.timer}>{formatTime(timeLeft)}</Text>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.btnStart} onPress={toggleTimer}>
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
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
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
    width: 120,
    borderRadius: 10,
    alignItems: "center",
  },
  btnReset: {
    backgroundColor: "#e74c3c",
    padding: 15,
    width: 120,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
