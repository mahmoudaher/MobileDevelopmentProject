import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";

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

const CATEGORIES = [
  { label: "Study", value: "Study" },
  { label: "Work", value: "Work" },
  { label: "Sport", value: "Sport" },
  { label: "Programming", value: "" },
  { label: "Other", value: "Other" },
] as const;

type Category = (typeof CATEGORIES)[number]["value"];

interface CategoryPickerProps {
  category: Category;
  setCategory: (value: Category) => void;
  running: boolean;
}

export default function CategoryPicker({
  category,
  setCategory,
  running,
}: CategoryPickerProps) {
  return (
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
              label={` ${cat.label}`}
              value={cat.value}
            />
          ))}
        </Picker>
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
});
