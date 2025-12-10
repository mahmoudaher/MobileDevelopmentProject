import * as SQLite from "expo-sqlite";

export type Session = {
  id?: number;
  duration: number;
  category: string;
  distractions: number;
  date: string;
};

export const db = SQLite.openDatabaseSync("focus.db");

export const createTables = async (): Promise<void> => {
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        duration INTEGER NOT NULL,
        category TEXT NOT NULL,
        distractions INTEGER NOT NULL DEFAULT 0,
        date TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS custom_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        created_at TEXT NOT NULL
      );
    `);
    console.log("Database tables created successfully");
  } catch (error) {
    console.error("Error creating tables:", error);
    throw error;
  }
};

export const saveSession = async (
  duration: number,
  category: string,
  distractions: number,
  date: string
): Promise<void> => {
  try {
    if (duration < 0 || distractions < 0) {
      throw new Error("Duration and distractions must be non-negative");
    }
    if (!category || !date) {
      throw new Error("Category and date are required");
    }

    await db.runAsync(
      `INSERT INTO sessions (duration, category, distractions, date)
       VALUES (?, ?, ?, ?);`,
      [duration, category, distractions, date]
    );
  } catch (error) {
    console.error("Error saving session:", error);
    throw error;
  }
};

export const fetchAllSessions = async (): Promise<Session[]> => {
  try {
    const result = await db.getAllAsync<Session>(
      "SELECT * FROM sessions ORDER BY date DESC, id DESC;"
    );
    return result || [];
  } catch (error) {
    console.error("Error fetching sessions:", error);
    throw error;
  }
};

export const getSessionsByDate = async (date: string): Promise<Session[]> => {
  try {
    const result = await db.getAllAsync<Session>(
      "SELECT * FROM sessions WHERE date = ? ORDER BY id DESC;",
      [date]
    );
    return result || [];
  } catch (error) {
    console.error("Error fetching sessions by date:", error);
    throw error;
  }
};

export const deleteSession = async (id: number): Promise<void> => {
  try {
    await db.runAsync("DELETE FROM sessions WHERE id = ?;", [id]);
  } catch (error) {
    console.error("Error deleting session:", error);
    throw error;
  }
};

// Custom Categories functions
export const saveCustomCategory = async (name: string): Promise<void> => {
  try {
    if (!name || name.trim().length === 0) {
      throw new Error("Category name is required");
    }

    const trimmedName = name.trim();
    await db.runAsync(
      `INSERT OR IGNORE INTO custom_categories (name, created_at)
       VALUES (?, ?);`,
      [trimmedName, new Date().toISOString()]
    );
  } catch (error) {
    console.error("Error saving custom category:", error);
    throw error;
  }
};

export const fetchCustomCategories = async (): Promise<string[]> => {
  try {
    const result = await db.getAllAsync<{ name: string }>(
      "SELECT name FROM custom_categories ORDER BY created_at DESC;"
    );
    return result?.map((row) => row.name) || [];
  } catch (error) {
    console.error("Error fetching custom categories:", error);
    throw error;
  }
};

export const deleteCustomCategory = async (name: string): Promise<void> => {
  try {
    await db.runAsync("DELETE FROM custom_categories WHERE name = ?;", [name]);
  } catch (error) {
    console.error("Error deleting custom category:", error);
    throw error;
  }
};
