import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/context/auth";

export default function Index() {
  const { token, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#080c14", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#3a8aff" size="large" />
      </View>
    );
  }

  if (!token) return <Redirect href={"/(auth)/welcome" as any} />;
  if (!user?.onboardingComplete) return <Redirect href={"/(onboarding)" as any} />;
  return <Redirect href={"/(main)" as any} />;
}
