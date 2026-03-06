import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuth } from "@/context/auth";

export default function Register() {
  const { register } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!fullName.trim() || !email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setError(null);
    setLoading(true);
    const err = await register(fullName.trim(), email.trim().toLowerCase(), password);
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      router.replace("/(onboarding)");
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Pressable style={styles.back} onPress={() => router.back()}>
        <MaterialIcons name="arrow-back-ios" size={18} color="#4a6fa5" />
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.heading}>Create account</Text>
        <Text style={styles.sub}>Let&apos;s get to know you</Text>

        <View style={styles.form}>
          <Field
            icon="person-outline"
            placeholder="Full name"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />
          <Field
            icon="mail-outline"
            placeholder="Email address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <View style={styles.inputWrap}>
            <MaterialIcons
              name="lock-outline"
              size={18}
              color="#4a6fa5"
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Password (8+ chars)"
              placeholderTextColor="#2a4a6a"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              returnKeyType="done"
              onSubmitEditing={handleRegister}
            />
            <Pressable
              onPress={() => setShowPassword((v) => !v)}
              style={styles.eyeBtn}
            >
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
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Create Account</Text>
            )}
          </Pressable>
        </View>

        <Pressable onPress={() => router.replace("/(auth)/login")}>
          <Text style={styles.switchText}>
            Already have an account?{" "}
            <Text style={styles.switchLink}>Sign in</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  icon,
  placeholder,
  value,
  onChangeText,
  autoCapitalize,
  keyboardType,
}: {
  icon: string;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  autoCapitalize?: "none" | "words" | "sentences";
  keyboardType?: "email-address" | "default";
}) {
  return (
    <View style={styles.inputWrap}>
      <MaterialIcons
        name={icon as any}
        size={18}
        color="#4a6fa5"
        style={styles.inputIcon}
      />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#2a4a6a"
        value={value}
        onChangeText={onChangeText}
        autoCapitalize={autoCapitalize ?? "none"}
        keyboardType={keyboardType ?? "default"}
        returnKeyType="next"
      />
    </View>
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
  backText: { color: "#4a6fa5", fontSize: 14 },
  content: {
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 28,
  },
  heading: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  sub: { color: "#4a6fa5", fontSize: 14, marginTop: -20 },
  form: { gap: 14 },
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
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: "#fff", fontSize: 15 },
  eyeBtn: { padding: 4 },
  errorText: { color: "#ff4a6a", fontSize: 13, paddingLeft: 4 },
  btn: {
    backgroundColor: "#1a4a8a",
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  pressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },
  switchText: { color: "#4a6fa5", fontSize: 14, textAlign: "center" },
  switchLink: { color: "#3a8aff", fontWeight: "600" },
});
