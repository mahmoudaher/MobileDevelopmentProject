import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { BarChart } from "react-native-chart-kit";

const COLORS = {
  primary: "#6366f1",
  primaryLight: "#818cf8",
  success: "#10b981",
  danger: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",
  background: "#f9fafb",
  surface: "#ffffff",
  border: "#e5e7eb",
  text: "#1f2937",
  textSecondary: "#6b7280",
  card1: "#eef2ff",
  card2: "#ecfdf5",
  card3: "#fef3c7",
};

interface WeeklyBarChartProps {
  barData: any;
}

export default function WeeklyBarChart({ barData }: WeeklyBarChartProps) {
  const chartConfig = {
    backgroundColor: COLORS.surface,
    backgroundGradientFrom: COLORS.surface,
    backgroundGradientTo: COLORS.surface,
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
    labelColor: () => COLORS.textSecondary,
    decimalPlaces: 0,
    style: {
      borderRadius: 12,
    },
  };

  return (
    <View style={styles.chartSection}>
      <Text style={styles.sectionTitle}>Weekly Activity</Text>
      <View style={styles.chartContainer}>
        {barData &&
          barData.datasets &&
          barData.datasets[0] &&
          barData.datasets[0].data.every(
            (d: any) => typeof d === "number" && !isNaN(d)
          ) && (
            <BarChart
              data={barData}
              width={Math.max(Dimensions.get("window").width - 40, 300)}
              height={240}
              yAxisLabel=""
              yAxisSuffix=" min"
              chartConfig={chartConfig}
              style={{ borderRadius: 12 }}
            />
          )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chartSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  chartContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
});
