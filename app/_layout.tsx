import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { createTables } from "./database/db";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

const LIGHT_THEME = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#6366f1",
    background: "#f9fafb",
    card: "#ffffff",
    text: "#1f2937",
    border: "#e5e7eb",
    notification: "#ef4444",
  },
};

const DARK_THEME = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: "#818cf8",
    background: "#111827",
    card: "#1f2937",
    text: "#f3f4f6",
    border: "#374151",
    notification: "#ef4444",
  },
};

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        await createTables();
        console.log("✓ Database tables initialized successfully");
      } catch (error) {
        console.error("✕ Database initialization error:", error);
      }
    };

    initializeDatabase();
  }, []);

  const theme = colorScheme === "dark" ? DARK_THEME : LIGHT_THEME;

  return (
    <ThemeProvider value={theme}>
      <Stack
        screenOptions={{
          headerShown: true,
          headerTitleStyle: {
            fontWeight: "700",
            fontSize: 18,
            color: theme.colors.text,
          },
          headerTintColor: theme.colors.primary,
          contentStyle: {
            backgroundColor: theme.colors.background,
          },
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="modal"
          options={{
            presentation: "modal",
            title: "Modal",
            headerTitleStyle: {
              fontWeight: "700",
            },
          }}
        />
      </Stack>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
    </ThemeProvider>
  );
}
