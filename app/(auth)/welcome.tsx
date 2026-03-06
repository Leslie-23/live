import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useAuth } from "@/context/auth";

export default function Welcome() {
  const { token, user } = useAuth();

  // If already logged in, skip welcome
  useEffect(() => {
    if (token) {
      router.replace(
        user?.onboardingComplete ? "/(main)" : "/(onboarding)"
      );
    }
  }, [token]);

  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + pulse.value * 0.25,
    transform: [{ scale: 1 + pulse.value * 0.08 }],
  }));

  return (
    <View style={styles.container}>
      {/* Background glow */}
      <Animated.View style={[styles.bgGlow, glowStyle]} />

      {/* Logo */}
      <View style={styles.logoArea}>
        <View style={styles.iconRing}>
          <MaterialIcons name="mic" size={40} color="#3a8aff" />
        </View>
        <Text style={styles.appName}>L I V E</Text>
        <Text style={styles.tagline}>Your Personal AI Companion</Text>
      </View>

      {/* Features blurb */}
      <View style={styles.features}>
        {[
          ["record-voice-over", "Listens and remembers"],
          ["psychology", "Learns your personality"],
          ["auto-awesome", "Thinks like you"],
        ].map(([icon, label]) => (
          <View key={icon} style={styles.featureRow}>
            <MaterialIcons name={icon as any} size={16} color="#4a6fa5" />
            <Text style={styles.featureText}>{label}</Text>
          </View>
        ))}
      </View>

      {/* CTAs */}
      <View style={styles.ctas}>
        <Pressable
          style={({ pressed }) => [styles.btnPrimary, pressed && styles.pressed]}
          onPress={() => router.push("/(auth)/register")}
        >
          <Text style={styles.btnPrimaryText}>Get Started</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.btnOutline, pressed && styles.pressed]}
          onPress={() => router.push("/(auth)/login")}
        >
          <Text style={styles.btnOutlineText}>Sign In</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080c14",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 40,
  },
  bgGlow: {
    position: "absolute",
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: "#1a4a8a",
    top: "20%",
    alignSelf: "center",
    opacity: 0.15,
  },
  logoArea: {
    alignItems: "center",
    gap: 12,
  },
  iconRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1.5,
    borderColor: "#1a4a8a",
    backgroundColor: "#0d1829",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  appName: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 10,
  },
  tagline: {
    color: "#4a6fa5",
    fontSize: 13,
    letterSpacing: 1.5,
  },
  features: {
    gap: 12,
    alignSelf: "stretch",
    paddingHorizontal: 8,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  featureText: {
    color: "#4a6fa5",
    fontSize: 14,
  },
  ctas: {
    alignSelf: "stretch",
    gap: 12,
  },
  btnPrimary: {
    backgroundColor: "#1a4a8a",
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimaryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  btnOutline: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1a4a8a",
    alignItems: "center",
    justifyContent: "center",
  },
  btnOutlineText: {
    color: "#4a6fa5",
    fontSize: 16,
    fontWeight: "500",
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
});
