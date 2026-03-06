import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "@/context/auth";

const RECORDINGS_DIR = FileSystem.documentDirectory + "recordings/";

type RecordingEntry = { uri: string; name: string; duration: number };

export default function Main() {
  const { user, logout } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<RecordingEntry[]>([]);
  const [statusText, setStatusText] = useState("Tap to listen");
  const recordingRef = useRef<Audio.Recording | null>(null);
  const startTimeRef = useRef<number>(0);

  const loudness = useSharedValue(0);
  const breathe = useSharedValue(0);

  useEffect(() => {
    if (!isRecording) {
      loudness.value = 0;
      breathe.value = withRepeat(
        withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      );
    } else {
      cancelAnimation(breathe);
      breathe.value = 0;
    }
  }, [isRecording]);

  useEffect(() => {
    FileSystem.makeDirectoryAsync(RECORDINGS_DIR, { intermediates: true }).catch(() => {});
  }, []);

  async function startRecording() {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) { setStatusText("Microphone permission denied"); return; }

      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync({
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        isMeteringEnabled: true,
      });

      rec.setOnRecordingStatusUpdate((status) => {
        if (!status.isRecording) return;
        const db = status.metering ?? -160;
        const normalised = Math.max(0, Math.min(1, (db + 60) / 60));
        loudness.value = withTiming(normalised, { duration: 80 });
      });

      await rec.startAsync();
      recordingRef.current = rec;
      startTimeRef.current = Date.now();
      setIsRecording(true);
      setStatusText("Listening…");
    } catch (e) {
      console.error(e);
      setStatusText("Could not start recording");
    }
  }

  async function stopRecording() {
    const rec = recordingRef.current;
    if (!rec) return;
    try {
      await rec.stopAndUnloadAsync();
      const uri = rec.getURI();
      recordingRef.current = null;
      const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
      const name = `rec_${Date.now()}.m4a`;
      const dest = RECORDINGS_DIR + name;
      if (uri) {
        await FileSystem.moveAsync({ from: uri, to: dest });
        setRecordings((prev) => [{ uri: dest, name, duration }, ...prev]);
      }
      setIsRecording(false);
      setStatusText("Tap to listen");
    } catch (e) {
      console.error(e);
      setStatusText("Error saving recording");
      setIsRecording(false);
    }
  }

  const ringStyle = (scale: number, opacityBase: number) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimatedStyle(() => {
      const breathScale = interpolate(breathe.value, [0, 1], [1, 1 + 0.06 * scale]);
      const liveScale = 1 + loudness.value * 0.35 * scale;
      const s = isRecording ? liveScale : breathScale;
      const opacity = isRecording
        ? interpolate(loudness.value, [0, 1], [opacityBase * 0.4, opacityBase])
        : interpolate(breathe.value, [0, 1], [opacityBase * 0.3, opacityBase * 0.7]);
      return { transform: [{ scale: s }], opacity };
    });

  const ring1Style = ringStyle(1.6, 0.5);
  const ring2Style = ringStyle(2.4, 0.3);
  const ring3Style = ringStyle(3.4, 0.15);

  async function handleLogout() {
    await logout();
    router.replace("/(auth)/welcome");
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appName}>LIVE</Text>
          <Text style={styles.subtitle}>
            {user ? `Hi, ${user.fullName.split(" ")[0]}` : "Personal Assistant"}
          </Text>
        </View>
        <Pressable onPress={handleLogout} style={styles.logoutBtn}>
          <MaterialIcons name="logout" size={20} color="#4a6fa5" />
        </Pressable>
      </View>

      {/* Mic */}
      <View style={styles.micArea}>
        <Animated.View style={[styles.ring, styles.ring3, ring3Style]} />
        <Animated.View style={[styles.ring, styles.ring2, ring2Style]} />
        <Animated.View style={[styles.ring, styles.ring1, ring1Style]} />
        <Pressable
          onPress={() => (isRecording ? stopRecording() : startRecording())}
          style={({ pressed }) => [
            styles.micButton,
            isRecording && styles.micButtonActive,
            pressed && styles.micButtonPressed,
          ]}
        >
          <MaterialIcons
            name={isRecording ? "stop" : "mic"}
            size={48}
            color="#fff"
          />
        </Pressable>
      </View>

      <Text style={styles.statusText}>{statusText}</Text>

      {recordings.length > 0 && (
        <View style={styles.recordings}>
          <Text style={styles.recordingsLabel}>
            {recordings.length} recording{recordings.length !== 1 ? "s" : ""} saved
          </Text>
          {recordings.slice(0, 3).map((r) => (
            <Text key={r.uri} style={styles.recordingItem}>
              {r.name}  ·  {r.duration}s
            </Text>
          ))}
          {recordings.length > 3 && (
            <Text style={styles.recordingItem}>+{recordings.length - 3} more</Text>
          )}
        </View>
      )}
    </View>
  );
}

const BUTTON_SIZE = 100;
const RING_SIZE = BUTTON_SIZE;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080c14",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    position: "absolute",
    top: 56,
    left: 0,
    right: 0,
    paddingHorizontal: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  appName: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 7,
  },
  subtitle: {
    color: "#4a6fa5",
    fontSize: 13,
    letterSpacing: 1,
    marginTop: 2,
  },
  logoutBtn: { padding: 4 },
  micArea: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  ring: { position: "absolute", borderRadius: 9999 },
  ring1: {
    width: RING_SIZE + 60, height: RING_SIZE + 60,
    backgroundColor: "#1a4a8a44", borderWidth: 1.5, borderColor: "#2a6abf55",
  },
  ring2: {
    width: RING_SIZE + 120, height: RING_SIZE + 120,
    backgroundColor: "#1a4a8a22", borderWidth: 1, borderColor: "#2a6abf33",
  },
  ring3: {
    width: RING_SIZE + 200, height: RING_SIZE + 200,
    backgroundColor: "#1a4a8a0a", borderWidth: 1, borderColor: "#2a6abf1a",
  },
  micButton: {
    width: BUTTON_SIZE, height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: "#1a4a8a",
    alignItems: "center", justifyContent: "center",
    shadowColor: "#3a8aff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6, shadowRadius: 20, elevation: 12,
  },
  micButtonActive: { backgroundColor: "#8a1a2a", shadowColor: "#ff3a5a" },
  micButtonPressed: { opacity: 0.8, transform: [{ scale: 0.95 }] },
  statusText: {
    color: "#4a6fa5", fontSize: 15, letterSpacing: 1.5,
    position: "absolute", bottom: 120,
  },
  recordings: {
    position: "absolute", bottom: 50, alignItems: "center", gap: 4,
  },
  recordingsLabel: { color: "#4a6fa5", fontSize: 12, letterSpacing: 1 },
  recordingItem: { color: "#2a4a6a", fontSize: 11, fontFamily: "monospace" },
});
