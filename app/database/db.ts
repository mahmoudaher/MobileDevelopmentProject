import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabase("focus.db");

// Create sessions table
export const createTables = () => {
  db.transaction((tx) => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        duration INTEGER,
        category TEXT,
        distractions INTEGER,
        date TEXT
      );`
    );
  });
};

// Save finished session
export const saveSession = (
  duration: number,
  category: string,
  distractions: number,
  date: string
) => {
  db.transaction((tx) => {
    tx.executeSql(
      `INSERT INTO sessions (duration, category, distractions, date)
       VALUES (?, ?, ?, ?);`,
      [duration, category, distractions, date]
    );
  });
};
