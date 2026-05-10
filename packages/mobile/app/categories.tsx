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
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { api } from "../lib/api";
import Ionicons from "@expo/vector-icons/Ionicons";

const CAT_ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  Flame: "flame-outline",
  Lightbulb: "bulb-outline",
  Circle: "radio-button-off-outline",
  AlignVerticalJustifyCenter: "reorder-four-outline",
  Navigation: "navigate-outline",
  Waves: "water-outline",
  Square: "square-outline",
  ChevronDown: "chevron-down-circle-outline",
  Minus: "remove-circle-outline",
  Scan: "scan-outline",
};

export default function CategoriesScreen() {
  const router = useRouter();
  const { locationSlug, locationName, locationIcon } = useLocalSearchParams<{
    locationSlug: string;
    locationName: string;
    locationIcon: string;
  }>();

  const { data, isLoading } = useQuery({
    queryKey: ["categories", locationSlug],
    queryFn: async () =>
      (await api.locations[":slug"].categories.$get({ param: { slug: locationSlug } })).json(),
    enabled: !!locationSlug,
  });

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen options={{ title: locationName ?? "照明種類" }} />

      {/* Location badge */}
      <View style={styles.breadcrumb}>
        <Ionicons name="home-outline" size={14} color="#c9a84c" />
        <Text style={styles.breadcrumbText}>{locationName}</Text>
        <Ionicons name="chevron-forward" size={12} color="#9aab9a" />
        <Text style={styles.breadcrumbCurrent}>照明種類を選択</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>照明の種類を選んでください</Text>
        <Text style={styles.subheading}>{locationName}に最適な照明タイプを選択</Text>

        {isLoading ? (
          <ActivityIndicator color="#c9a84c" style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.grid}>
            {data?.categories.map((cat) => {
              const iconName = CAT_ICON_MAP[cat.icon] ?? "bulb-outline";
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.card}
                  activeOpacity={0.7}
                  onPress={() =>
                    router.push({
                      pathname: "/products",
                      params: {
                        categorySlug: cat.slug,
                        categoryName: cat.name,
                        categoryIcon: cat.icon,
                        locationName,
                      },
                    })
                  }
                >
                  <View style={styles.iconBox}>
                    <Ionicons name={iconName} size={28} color="#c9a84c" />
                  </View>
                  <Text style={styles.cardTitle}>{cat.name}</Text>
                  <Text style={styles.cardDesc} numberOfLines={2}>
                    {cat.description}
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
  breadcrumb: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#152015",
    borderBottomWidth: 1,
    borderBottomColor: "#2d4a2d",
  },
  breadcrumbText: { fontSize: 12, color: "#c9a84c" },
  breadcrumbCurrent: { fontSize: 12, color: "#9aab9a" },
  content: { padding: 16, paddingBottom: 32 },
  heading: { fontSize: 20, fontWeight: "700", color: "#f0ede6", marginBottom: 6 },
  subheading: { fontSize: 13, color: "#9aab9a", marginBottom: 20 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
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
  cardTitle: { fontSize: 13, fontWeight: "600", color: "#f0ede6" },
  cardDesc: { fontSize: 12, color: "#9aab9a", lineHeight: 17 },
  cardArrow: { flexDirection: "row", alignItems: "center", gap: 4 },
  cardArrowText: { fontSize: 12, color: "#c9a84c" },
});
