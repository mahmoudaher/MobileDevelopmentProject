import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  try {
    let token;

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        return null;
      }

      token = (await Notifications.getExpoPushTokenAsync()).data;
    } else {
      return null;
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    return token;
  } catch {
    return null;
  }
}

export async function scheduleSessionEndNotification() {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Session Finished",
        body: "Your focus time is done.",
        sound: "default",
      },
      trigger: null,
    });
  } catch {}
}

export async function scheduleBackgroundNotification() {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Session Paused",
        body: "You left the app, Distraction counted",
        sound: "default",
      },
      trigger: null,
    });
  } catch {}
}
