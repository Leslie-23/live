import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuth } from "@/context/auth";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError(null);
    setLoading(true);
    const err = await login(email.trim().toLowerCase(), password);
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      router.replace("/(main)");
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Back */}
      <Pressable style={styles.back} onPress={() => router.back()}>
        <MaterialIcons name="arrow-back-ios" size={18} color="#4a6fa5" />
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <View style={styles.content}>
        <Text style={styles.heading}>Welcome back</Text>
        <Text style={styles.sub}>Sign in to continue</Text>

        <View style={styles.form}>
          {/* Email */}
          <View style={styles.inputWrap}>
            <MaterialIcons name="mail-outline" size={18} color="#4a6fa5" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor="#2a4a6a"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="next"
            />
          </View>

          {/* Password */}
          <View style={styles.inputWrap}>
            <MaterialIcons name="lock-outline" size={18} color="#4a6fa5" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Password"
              placeholderTextColor="#2a4a6a"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <Pressable onPress={() => setShowPassword((v) => !v)} style={styles.eyeBtn}>
              <MaterialIcons
                name={showPassword ? "visibility-off" : "visibility"}
                size={18}
                color="#4a6fa5"
              />
            </Pressable>
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Pressable
            style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Sign In</Text>
            )}
          </Pressable>
        </View>

        <Pressable onPress={() => router.replace("/(auth)/register")}>
          <Text style={styles.switchText}>
            Don&apos;t have an account?{" "}
            <Text style={styles.switchLink}>Create one</Text>
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080c14",
  },
  back: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingTop: 56,
    gap: 2,
  },
  backText: {
    color: "#4a6fa5",
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 24,
    gap: 28,
  },
  heading: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  sub: {
    color: "#4a6fa5",
    fontSize: 14,
    marginTop: -20,
  },
  form: {
    gap: 14,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0d1829",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1a2a4a",
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
  },
  eyeBtn: {
    padding: 4,
  },
  errorText: {
    color: "#ff4a6a",
    fontSize: 13,
    paddingLeft: 4,
  },
  btn: {
    backgroundColor: "#1a4a8a",
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
  switchText: {
    color: "#4a6fa5",
    fontSize: 14,
    textAlign: "center",
  },
  switchLink: {
    color: "#3a8aff",
    fontWeight: "600",
  },
});
