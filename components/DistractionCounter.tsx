import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

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

interface DistractionCounterProps {
  distractions: number;
  setDistractions: (value: number | ((prev: number) => number)) => void;
  running: boolean;
}

export default function DistractionCounter({
  distractions,
  setDistractions,
  running,
}: DistractionCounterProps) {
  return (
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
  );
}

const styles = StyleSheet.create({
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
});
