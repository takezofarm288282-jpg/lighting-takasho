import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { api } from "../lib/api";
import Ionicons from "@expo/vector-icons/Ionicons";

const LOCATION_ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  Home: "home-outline",
  Trees: "leaf-outline",
  Car: "car-outline",
  Grid3x3: "grid-outline",
  Waves: "water-outline",
  Fence: "albums-outline",
};

export default function HomeScreen() {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => (await api.locations.$get()).json(),
  });

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.brand}>TAKASHO</Text>
        <Text style={styles.title}>
          <Text style={styles.titleAccent}>外構照明</Text> セレクター
        </Text>
        <Text style={styles.subtitle}>
          設置場所を選んで最適な照明を見つけましょう
        </Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionLabel}>STEP 1 — 設置場所を選んでください</Text>

        {isLoading ? (
          <ActivityIndicator color="#c9a84c" style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.grid}>
            {data?.locations.map((loc) => {
              const iconName = LOCATION_ICON_MAP[loc.icon] ?? "bulb-outline";
              return (
                <TouchableOpacity
                  key={loc.id}
                  style={styles.card}
                  activeOpacity={0.7}
                  onPress={() =>
                    router.push({
                      pathname: "/categories",
                      params: {
                        locationSlug: loc.slug,
                        locationName: loc.name,
                        locationIcon: loc.icon,
                      },
                    })
                  }
                >
                  <View style={styles.iconBox}>
                    <Ionicons name={iconName} size={28} color="#c9a84c" />
                  </View>
                  <Text style={styles.cardTitle}>{loc.name}</Text>
                  <Text style={styles.cardDesc} numberOfLines={2}>
                    {loc.description}
                  </Text>
                  <View style={styles.cardArrow}>
                    <Text style={styles.cardArrowText}>選択する</Text>
                    <Ionicons name="chevron-forward" size={14} color="#c9a84c" />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d1a0d" },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#2d4a2d",
    backgroundColor: "#152015",
  },
  brand: {
    fontSize: 10,
    letterSpacing: 4,
    color: "#9aab9a",
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#f0ede6",
    marginBottom: 6,
  },
  titleAccent: { color: "#c9a84c" },
  subtitle: { fontSize: 13, color: "#9aab9a" },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },
  sectionLabel: {
    fontSize: 11,
    letterSpacing: 1,
    color: "#9aab9a",
    marginBottom: 16,
    textTransform: "uppercase",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    width: "47%",
    backgroundColor: "#152015",
    borderWidth: 1,
    borderColor: "#2d4a2d",
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(201,168,76,0.1)",
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontSize: 14, fontWeight: "600", color: "#f0ede6" },
  cardDesc: { fontSize: 12, color: "#9aab9a", lineHeight: 17 },
  cardArrow: { flexDirection: "row", alignItems: "center", gap: 4 },
  cardArrowText: { fontSize: 12, color: "#c9a84c" },
});
