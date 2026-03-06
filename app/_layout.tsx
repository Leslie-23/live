import { Stack } from "expo-router";
import { AuthProvider } from "@/context/auth";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#080c14" },
        }}
      />
    </AuthProvider>
  );
}
