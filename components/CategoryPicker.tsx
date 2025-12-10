import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { saveCustomCategory, fetchCustomCategories } from "../app/database/db";

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

const DEFAULT_CATEGORIES = [
  { label: "Study", value: "Study" },
  { label: "Work", value: "Work" },
  { label: "Sport", value: "Sport" },
] as const;

type Category = string;

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
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  useEffect(() => {
    loadCustomCategories();
  }, []);

  const loadCustomCategories = async () => {
    try {
      const categories = await fetchCustomCategories();
      setCustomCategories(categories);
    } catch (error) {
      console.error("Error loading custom categories:", error);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert("Error", "Please enter a category name");
      return;
    }

    const trimmedName = newCategoryName.trim();

    // Check if category already exists
    const allCategories = [
      ...DEFAULT_CATEGORIES.map((cat) => cat.value),
      ...customCategories,
    ];

    if (allCategories.includes(trimmedName)) {
      Alert.alert("Error", "This category already exists");
      return;
    }

    try {
      await saveCustomCategory(trimmedName);
      await loadCustomCategories();
      setCategory(trimmedName);
      setNewCategoryName("");
      setShowAddModal(false);
    } catch (error) {
      Alert.alert("Error", "Failed to save category");
      console.error("Error saving category:", error);
    }
  };

  const allCategories = [
    ...DEFAULT_CATEGORIES,
    ...customCategories.map((cat) => ({ label: cat, value: cat })),
    { label: "+ Add Category", value: "__add__" },
  ];

  const handleValueChange = (value: string) => {
    if (value === "__add__") {
      setShowAddModal(true);
    } else {
      setCategory(value);
    }
  };

  return (
    <>
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Focus Category</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={category}
            onValueChange={handleValueChange}
            style={styles.picker}
            enabled={!running}
          >
            {allCategories.map((cat) => (
              <Picker.Item
                key={cat.value}
                label={` ${cat.label}`}
                value={cat.value}
              />
            ))}
          </Picker>
        </View>
      </View>

      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Category</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter category name"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              autoFocus={true}
              maxLength={30}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowAddModal(false);
                  setNewCategoryName("");
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.addButton]}
                onPress={handleAddCategory}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    width: "80%",
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: COLORS.background,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  addButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButtonText: {
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  addButtonText: {
    color: COLORS.surface,
    fontWeight: "600",
  },
});
