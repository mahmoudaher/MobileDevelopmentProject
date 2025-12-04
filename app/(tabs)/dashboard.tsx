import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  RefreshControl,
} from "react-native";
import { fetchAllSessions, type Session } from "../database/db";
import { PieChart, BarChart } from "react-native-chart-kit";

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

export default function Dashboard() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [todayTotal, setTodayTotal] = useState(0);
  const [allTimeTotal, setAllTimeTotal] = useState(0);
  const [totalDistractions, setTotalDistractions] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadSessions = async () => {
    const data = await fetchAllSessions();
    setSessions(data);
    calculateStatistics(data);
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const calculateStatistics = (data: Session[]) => {
    const today = new Date().toISOString().split("T")[0];

    let todaySum = 0;
    let allSum = 0;
    let distractionSum = 0;

    data.forEach((s) => {
      allSum += s.duration;
      if (s.date === today) todaySum += s.duration;
      distractionSum += s.distractions;
    });

    setTodayTotal(todaySum);
    setAllTimeTotal(allSum);
    setTotalDistractions(distractionSum);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadSessions();
    setIsRefreshing(false);
  };

  const formatMinutes = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    return minutes.toLocaleString();
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getLast7Days = (): { date: string; label: string }[] => {
    const arr: { date: string; label: string }[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);

      arr.push({
        date: d.toISOString().split("T")[0],
        label: d.toLocaleDateString("en-US", { weekday: "short" }),
      });
    }
    return arr;
  };

  const buildWeeklyData = () => {
    const days = getLast7Days();

    const values = days.map((d) => {
      const total = sessions
        .filter((s) => s.date === d.date)
        .reduce((sum, s) => sum + s.duration, 0);

      return Math.floor(total / 60);
    });

    return {
      labels: days.map((d) => d.label),
      datasets: [{ data: values }],
    };
  };

  const categoryMap: Record<string, number> = {};
  sessions.forEach((s) => {
    if (!categoryMap[s.category]) categoryMap[s.category] = 0;
    categoryMap[s.category] += 1;
  });

  const chartColors = [
    "#6366f1",
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
  ];

  const pieData = Object.keys(categoryMap).map((cat, index) => ({
    name: cat,
    population: categoryMap[cat],
    color: chartColors[index % chartColors.length],
    legendFontColor: COLORS.text,
    legendFontSize: 13,
  }));

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={COLORS.primary}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics</Text>
        <Text style={styles.headerSubtitle}>Your focus insights</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, styles.statCard1]}>
          <Text style={styles.statIcon}>🎯</Text>
          <Text style={styles.statLabel}>Today</Text>
          <Text style={styles.statValue}>{formatDuration(todayTotal)}</Text>
          <Text style={styles.statSubtext}>focused time</Text>
        </View>

        <View style={[styles.statCard, styles.statCard2]}>
          <Text style={styles.statIcon}>🏆</Text>
          <Text style={styles.statLabel}>Total</Text>
          <Text style={styles.statValue}>{formatMinutes(allTimeTotal)}</Text>
          <Text style={styles.statSubtext}>minutes</Text>
        </View>
      </View>

      <View style={[styles.card, styles.distractionsCard]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>⚠️</Text>
          <Text style={styles.cardTitle}>Distractions</Text>
        </View>
        <Text style={styles.distractionsValue}>{totalDistractions}</Text>
        <Text style={styles.cardDescription}>
          times distracted this session
        </Text>
      </View>

      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Weekly Activity</Text>
        <View style={styles.chartContainer}>
          <BarChart
            data={buildWeeklyData()}
            width={Dimensions.get("window").width - 40}
            height={240}
            yAxisLabel=""
            yAxisSuffix=" min"
            chartConfig={{
              backgroundColor: COLORS.surface,
              backgroundGradientFrom: COLORS.surface,
              backgroundGradientTo: COLORS.surface,
              color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
              labelColor: () => COLORS.textSecondary,
              decimalPlaces: 0,
              style: {
                borderRadius: 12,
              },
            }}
            style={{ borderRadius: 12 }}
          />
        </View>
      </View>

      {pieData.length > 0 && (
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
              absolute
            />
          </View>
        </View>
      )}

      {sessions.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>📊</Text>
          <Text style={styles.emptyStateTitle}>No sessions yet</Text>
          <Text style={styles.emptyStateDescription}>
            Start a focus session to see your analytics here
          </Text>
        </View>
      )}

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  header: {
    marginBottom: 24,
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
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statCard1: {
    backgroundColor: COLORS.card1,
    borderColor: `${COLORS.primary}30`,
  },
  statCard2: {
    backgroundColor: COLORS.card2,
    borderColor: `${COLORS.success}30`,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 4,
  },
  statSubtext: {
    fontSize: 11,
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
  distractionsCard: {
    backgroundColor: `${COLORS.danger}08`,
    borderColor: `${COLORS.danger}30`,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  cardDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 8,
    fontWeight: "500",
  },
  distractionsValue: {
    fontSize: 40,
    fontWeight: "800",
    color: COLORS.danger,
    marginVertical: 8,
  },
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
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    maxWidth: 200,
  },
});
