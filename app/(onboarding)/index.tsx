import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { api } from "@/services/api";
import { useAuth } from "@/context/auth";

// ── Data options (mirrors MongoDB schema) ─────────────────────────────────────

const TRAITS = [
  "Analytical", "Creative", "Technical", "Social",
  "Curious", "Methodical", "Spontaneous", "Detail-oriented",
  "Visionary", "Pragmatic",
];

const HUMOR_STYLES = ["Dry", "Sarcastic", "Witty", "Playful", "None"];

const COMM_STYLES = ["Technical", "Casual", "Formal", "Direct", "Expressive"];

const GENDERS = ["Male", "Female", "Non-binary", "Prefer not to say"];

// ── Step config ───────────────────────────────────────────────────────────────

const STEPS = ["About you", "Personality", "Your style"];

// ── Component ─────────────────────────────────────────────────────────────────

export default function Onboarding() {
  const { refreshUser } = useAuth();

  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Step 1 fields
  const [username, setUsername] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");

  // Step 2 fields
  const [traits, setTraits] = useState<string[]>([]);

  // Step 3 fields
  const [humorStyle, setHumorStyle] = useState("");
  const [commStyle, setCommStyle] = useState("");

  function toggleTrait(t: string) {
    setTraits((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }

  function validateStep(): boolean {
    setError(null);
    if (step === 0) {
      if (!username.trim()) { setError("Username is required."); return false; }
      if (!birthDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        setError("Enter birth date as YYYY-MM-DD."); return false;
      }
      if (!gender) { setError("Please select a gender."); return false; }
    }
    if (step === 1) {
      if (traits.length === 0) { setError("Select at least one trait."); return false; }
    }
    if (step === 2) {
      if (!humorStyle) { setError("Select a humor style."); return false; }
      if (!commStyle) { setError("Select a communication style."); return false; }
    }
    return true;
  }

  async function handleNext() {
    if (!validateStep()) return;
    if (step < 2) { setStep((s) => s + 1); return; }

    // Final submit
    setLoading(true);
    const { error: apiErr } = await api.onboarding.complete({
      username: username.trim().toLowerCase(),
      birthDate,
      gender,
      traits,
      humorStyle,
      communicationStyle: commStyle,
    });
    setLoading(false);

    if (apiErr) {
      setError(apiErr);
      return;
    }

    await refreshUser();
    router.replace("/(main)");
  }

  return (
    <View style={styles.container}>
      {/* Progress dots */}
      <View style={styles.progressBar}>
        {STEPS.map((label, i) => (
          <View key={label} style={styles.progressStep}>
            <View style={[styles.dot, i <= step && styles.dotActive]}>
              {i < step && (
                <MaterialIcons name="check" size={12} color="#fff" />
              )}
              {i >= step && (
                <Text style={[styles.dotNum, i === step && styles.dotNumActive]}>
                  {i + 1}
                </Text>
              )}
            </View>
            {i < STEPS.length - 1 && (
              <View style={[styles.line, i < step && styles.lineActive]} />
            )}
          </View>
        ))}
      </View>

      <Text style={styles.stepLabel}>{STEPS[step]}</Text>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {step === 0 && (
          <Step1
            username={username}
            setUsername={setUsername}
            birthDate={birthDate}
            setBirthDate={setBirthDate}
            gender={gender}
            setGender={setGender}
          />
        )}
        {step === 1 && (
          <Step2 traits={traits} toggleTrait={toggleTrait} />
        )}
        {step === 2 && (
          <Step3
            humorStyle={humorStyle}
            setHumorStyle={setHumorStyle}
            commStyle={commStyle}
            setCommStyle={setCommStyle}
          />
        )}
      </ScrollView>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.footer}>
        {step > 0 && (
          <Pressable
            style={({ pressed }) => [styles.btnBack, pressed && styles.pressed]}
            onPress={() => { setError(null); setStep((s) => s - 1); }}
          >
            <Text style={styles.btnBackText}>Back</Text>
          </Pressable>
        )}
        <Pressable
          style={({ pressed }) => [styles.btnNext, pressed && styles.pressed]}
          onPress={handleNext}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnNextText}>
              {step === 2 ? "Finish" : "Continue"}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

// ── Steps ─────────────────────────────────────────────────────────────────────

function Step1({
  username, setUsername, birthDate, setBirthDate, gender, setGender,
}: {
  username: string; setUsername: (v: string) => void;
  birthDate: string; setBirthDate: (v: string) => void;
  gender: string; setGender: (v: string) => void;
}) {
  return (
    <View style={s1.container}>
      <Text style={s1.hint}>This personalises your AI companion.</Text>

      <InputField
        icon="alternate-email"
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <InputField
        icon="cake"
        placeholder="Birth date (YYYY-MM-DD)"
        value={birthDate}
        onChangeText={setBirthDate}
        keyboardType="numeric"
      />

      <Text style={s1.sectionLabel}>Gender</Text>
      <View style={s1.chips}>
        {GENDERS.map((g) => (
          <Chip key={g} label={g} selected={gender === g} onPress={() => setGender(g)} />
        ))}
      </View>
    </View>
  );
}

function Step2({
  traits, toggleTrait,
}: { traits: string[]; toggleTrait: (t: string) => void }) {
  return (
    <View style={s2.container}>
      <Text style={s2.hint}>Select traits that describe you. Pick as many as fit.</Text>
      <View style={s2.chips}>
        {TRAITS.map((t) => (
          <Chip key={t} label={t} selected={traits.includes(t)} onPress={() => toggleTrait(t)} />
        ))}
      </View>
    </View>
  );
}

function Step3({
  humorStyle, setHumorStyle, commStyle, setCommStyle,
}: {
  humorStyle: string; setHumorStyle: (v: string) => void;
  commStyle: string; setCommStyle: (v: string) => void;
}) {
  return (
    <View style={s3.container}>
      <Text style={s3.sectionLabel}>Humor style</Text>
      <View style={s3.chips}>
        {HUMOR_STYLES.map((h) => (
          <Chip key={h} label={h} selected={humorStyle === h} onPress={() => setHumorStyle(h)} />
        ))}
      </View>

      <Text style={[s3.sectionLabel, { marginTop: 24 }]}>Communication style</Text>
      <View style={s3.chips}>
        {COMM_STYLES.map((c) => (
          <Chip key={c} label={c} selected={commStyle === c} onPress={() => setCommStyle(c)} />
        ))}
      </View>
    </View>
  );
}

// ── Shared primitives ─────────────────────────────────────────────────────────

function Chip({
  label, selected, onPress,
}: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[chipStyles.chip, selected && chipStyles.chipOn]}
    >
      <Text style={[chipStyles.text, selected && chipStyles.textOn]}>{label}</Text>
    </Pressable>
  );
}

function InputField({
  icon, placeholder, value, onChangeText, autoCapitalize, keyboardType,
}: {
  icon: string; placeholder: string; value: string;
  onChangeText: (v: string) => void;
  autoCapitalize?: "none" | "words";
  keyboardType?: "numeric" | "default";
}) {
  return (
    <View style={inputStyles.wrap}>
      <MaterialIcons name={icon as any} size={18} color="#4a6fa5" style={inputStyles.icon} />
      <TextInput
        style={inputStyles.input}
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

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080c14",
    paddingTop: 60,
  },
  progressBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 28,
    marginBottom: 28,
  },
  progressStep: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#0d1829",
    borderWidth: 1.5,
    borderColor: "#1a2a4a",
    alignItems: "center",
    justifyContent: "center",
  },
  dotActive: {
    backgroundColor: "#1a4a8a",
    borderColor: "#3a8aff",
  },
  dotNum: { color: "#2a4a6a", fontSize: 12, fontWeight: "600" },
  dotNumActive: { color: "#fff" },
  line: {
    flex: 1,
    height: 1.5,
    backgroundColor: "#1a2a4a",
  },
  lineActive: { backgroundColor: "#3a8aff" },
  stepLabel: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    paddingHorizontal: 28,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 28,
    paddingBottom: 20,
  },
  errorText: {
    color: "#ff4a6a",
    fontSize: 13,
    paddingHorizontal: 28,
    marginBottom: 8,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 28,
    paddingBottom: 40,
    paddingTop: 8,
  },
  btnBack: {
    height: 52,
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1a2a4a",
    alignItems: "center",
    justifyContent: "center",
  },
  btnBackText: { color: "#4a6fa5", fontSize: 16 },
  btnNext: {
    height: 52,
    flex: 2,
    borderRadius: 14,
    backgroundColor: "#1a4a8a",
    alignItems: "center",
    justifyContent: "center",
  },
  btnNextText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  pressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },
});

const s1 = StyleSheet.create({
  container: { gap: 14 },
  hint: { color: "#4a6fa5", fontSize: 13, marginBottom: 6 },
  sectionLabel: { color: "#4a6fa5", fontSize: 12, letterSpacing: 1, marginTop: 8 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});

const s2 = StyleSheet.create({
  container: { gap: 16 },
  hint: { color: "#4a6fa5", fontSize: 13 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});

const s3 = StyleSheet.create({
  container: { gap: 10 },
  sectionLabel: { color: "#4a6fa5", fontSize: 12, letterSpacing: 1 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});

const chipStyles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#0d1829",
    borderWidth: 1,
    borderColor: "#1a2a4a",
  },
  chipOn: {
    backgroundColor: "#1a3a6a",
    borderColor: "#3a8aff",
  },
  text: { color: "#4a6fa5", fontSize: 13 },
  textOn: { color: "#fff", fontWeight: "600" },
});

const inputStyles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0d1829",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1a2a4a",
    paddingHorizontal: 14,
    height: 52,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, color: "#fff", fontSize: 15 },
});
