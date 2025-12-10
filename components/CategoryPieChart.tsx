import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { PieChart } from "react-native-chart-kit";

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

interface CategoryPieChartProps {
  pieData: any[];
}

export default function CategoryPieChart({ pieData }: CategoryPieChartProps) {
  const chartConfig = {
    backgroundGradientFrom: COLORS.surface,
    backgroundGradientTo: COLORS.surface,
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
    labelColor: (opacity = 1) => "#ffffff",
  };

  if (!pieData || pieData.length === 0) return null;

  return (
    <View style={styles.chartSection}>
      <Text style={styles.sectionTitle}>Categories Breakdown</Text>
      <View style={styles.chartContainer}>
        <PieChart
          data={pieData}
          width={Dimensions.get("window").width - 40}
          height={220}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="0"
          chartConfig={chartConfig}
          absolute
        />
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
