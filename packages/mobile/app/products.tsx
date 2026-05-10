import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Modal,
  Pressable,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, Stack } from "expo-router";
import { useState, useCallback } from "react";
import { api } from "../lib/api";
import Ionicons from "@expo/vector-icons/Ionicons";

interface EstimateItem {
  productId: number;
  quantity: number;
}

interface Product {
  id: number;
  name: string;
  modelNo: string;
  price: number;
  lumen: number | null;
  colorTemp: string | null;
  ipRating: string | null;
  style: string | null;
  watt: number | null;
  catalogPage: number | null;
  description: string | null;
  features: string | null;
  category: { name: string };
}

export default function ProductsScreen() {
  const { categorySlug, categoryName, locationName } = useLocalSearchParams<{
    categorySlug: string;
    categoryName: string;
    locationName: string;
  }>();

  const [estimateItems, setEstimateItems] = useState<EstimateItem[]>([]);
  const [showEstimate, setShowEstimate] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["products", categorySlug],
    queryFn: async () =>
      (await api.products.$get({ query: { category: categorySlug } })).json(),
    enabled: !!categorySlug,
  });

  const addItem = useCallback((productId: number) => {
    setEstimateItems((prev) => {
      const ex = prev.find((i) => i.productId === productId);
      if (ex) return prev.map((i) => i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { productId, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((productId: number) => {
    setEstimateItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const updateQty = useCallback((productId: number, qty: number) => {
    if (qty <= 0) { removeItem(productId); return; }
    setEstimateItems((prev) => prev.map((i) => i.productId === productId ? { ...i, quantity: qty } : i));
  }, [removeItem]);

  const getQty = (productId: number) => estimateItems.find((i) => i.productId === productId)?.quantity ?? 0;
  const totalCount = estimateItems.reduce((s, i) => s + i.quantity, 0);

  const products = (data?.products as unknown as Product[]) ?? [];

  // estimate calculation
  const estimateRows = estimateItems.map((item) => {
    const p = products.find((p) => p.id === item.productId);
    if (!p) return null;
    return { product: p, quantity: item.quantity, subtotal: p.price * item.quantity };
  }).filter(Boolean) as { product: Product; quantity: number; subtotal: number }[];

  const subtotal = estimateRows.reduce((s, r) => s + r.subtotal, 0);
  const tax = Math.floor(subtotal * 0.1);
  const total = subtotal + tax;

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen options={{ title: categoryName ?? "商品一覧" }} />

      {/* Breadcrumb */}
      <View style={styles.breadcrumb}>
        <Text style={styles.bcItem}>{locationName}</Text>
        <Ionicons name="chevron-forward" size={12} color="#9aab9a" />
        <Text style={styles.bcActive}>{categoryName}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.listHeader}>
          <Text style={styles.count}>{products.length}件の商品</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator color="#c9a84c" style={{ marginTop: 40 }} />
        ) : products.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={40} color="#9aab9a" />
            <Text style={styles.emptyText}>商品が見つかりません</Text>
          </View>
        ) : (
          products.map((product) => {
            const qty = getQty(product.id);
            const inCart = qty > 0;
            const features: string[] = product.features ? JSON.parse(product.features) : [];
            return (
              <View key={product.id} style={[styles.card, inCart && styles.cardActive]}>
                {/* Product image area */}
                <View style={styles.imgBox}>
                  {product.imageUrl ? (
                    <Image
                      source={{ uri: product.imageUrl }}
                      style={styles.productImg}
                      resizeMode="cover"
                    />
                  ) : (
                    <Ionicons name="bulb-outline" size={40} color="rgba(201,168,76,0.3)" />
                  )}
                  {inCart && (
                    <View style={styles.cartBadge}>
                      <Text style={styles.cartBadgeText}>{qty}</Text>
                    </View>
                  )}
                  {product.catalogPage && (
                    <View style={styles.pageBadge}>
                      <Ionicons name="book-outline" size={10} color="#9aab9a" />
                      <Text style={styles.pageBadgeText}>P.{product.catalogPage}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.cardBody}>
                  <Text style={styles.modelNo}>{product.modelNo}</Text>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productDesc} numberOfLines={2}>{product.description}</Text>

                  {/* Spec chips */}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
                    {product.lumen && (
                      <View style={[styles.chip, { backgroundColor: "rgba(201,168,76,0.12)" }]}>
                        <Ionicons name="flash-outline" size={10} color="#c9a84c" />
                        <Text style={[styles.chipText, { color: "#c9a84c" }]}>{product.lumen}lm</Text>
                      </View>
                    )}
                    {product.ipRating && (
                      <View style={[styles.chip, { backgroundColor: "rgba(74,222,128,0.12)" }]}>
                        <Ionicons name="water-outline" size={10} color="#4ade80" />
                        <Text style={[styles.chipText, { color: "#4ade80" }]}>{product.ipRating}</Text>
                      </View>
                    )}
                    {product.colorTemp && (
                      <View style={[styles.chip, { backgroundColor: "rgba(251,191,36,0.12)" }]}>
                        <Ionicons name="sunny-outline" size={10} color="#fbbf24" />
                        <Text style={[styles.chipText, { color: "#fbbf24" }]}>{product.colorTemp.split(" ")[0]}</Text>
                      </View>
                    )}
                    {product.style && (
                      <View style={[styles.chip, { backgroundColor: "rgba(167,139,250,0.12)" }]}>
                        <Text style={[styles.chipText, { color: "#a78bfa" }]}>{product.style}</Text>
                      </View>
                    )}
                  </ScrollView>

                  {/* Price + action */}
                  <View style={styles.priceRow}>
                    <View>
                      <Text style={styles.price}>¥{product.price.toLocaleString()}</Text>
                      <Text style={styles.priceSub}>税別</Text>
                    </View>
                    {!inCart ? (
                      <TouchableOpacity style={styles.addBtn} onPress={() => addItem(product.id)}>
                        <Ionicons name="add" size={16} color="#0d1a0d" />
                        <Text style={styles.addBtnText}>追加</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.qtyRow}>
                        <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(product.id, qty - 1)}>
                          <Ionicons name="remove" size={16} color="#f0ede6" />
                        </TouchableOpacity>
                        <Text style={styles.qtyNum}>{qty}</Text>
                        <TouchableOpacity style={styles.qtyBtn} onPress={() => addItem(product.id)}>
                          <Ionicons name="add" size={16} color="#f0ede6" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })
        )}

        <View style={{ height: totalCount > 0 ? 90 : 0 }} />
      </ScrollView>

      {/* Floating estimate button */}
      {totalCount > 0 && (
        <View style={styles.floatBar}>
          <Text style={styles.floatCount}>{totalCount}点を選択中</Text>
          <TouchableOpacity style={styles.floatBtn} onPress={() => setShowEstimate(true)}>
            <Ionicons name="receipt-outline" size={16} color="#0d1a0d" />
            <Text style={styles.floatBtnText}>見積もりを確認</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Estimate Modal */}
      <Modal
        visible={showEstimate}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEstimate(false)}
      >
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>お見積もり</Text>
            <TouchableOpacity onPress={() => setShowEstimate(false)}>
              <Ionicons name="close" size={24} color="#9aab9a" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
            {estimateRows.map((row) => (
              <View key={row.product.id} style={styles.estimateRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.eName}>{row.product.name}</Text>
                  <Text style={styles.eModel}>{row.product.modelNo}</Text>
                  <Text style={styles.eUnit}>¥{row.product.price.toLocaleString()} × {row.quantity}</Text>
                </View>
                <View style={styles.eRight}>
                  <View style={styles.qtyRow}>
                    <TouchableOpacity style={styles.qtyBtnSm} onPress={() => updateQty(row.product.id, row.quantity - 1)}>
                      <Ionicons name="remove" size={12} color="#f0ede6" />
                    </TouchableOpacity>
                    <Text style={styles.qtyNumSm}>{row.quantity}</Text>
                    <TouchableOpacity style={styles.qtyBtnSm} onPress={() => addItem(row.product.id)}>
                      <Ionicons name="add" size={12} color="#f0ede6" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.eSubtotal}>¥{row.subtotal.toLocaleString()}</Text>
                  <TouchableOpacity onPress={() => removeItem(row.product.id)}>
                    <Ionicons name="trash-outline" size={16} color="#f87171" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* Total */}
            <View style={styles.totalBox}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>小計（税別）</Text>
                <Text style={styles.totalValue}>¥{subtotal.toLocaleString()}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>消費税（10%）</Text>
                <Text style={styles.totalValue}>¥{tax.toLocaleString()}</Text>
              </View>
              <View style={[styles.totalRow, styles.totalFinal]}>
                <Text style={styles.totalFinalLabel}>合計（税込）</Text>
                <Text style={styles.totalFinalValue}>¥{total.toLocaleString()}</Text>
              </View>
            </View>

            <Text style={styles.note}>
              ※ 工事費・配線費用は含まれていません。別途お見積もりが必要です。
            </Text>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={() => { setEstimateItems([]); setShowEstimate(false); }}
            >
              <Text style={styles.resetBtnText}>リセット</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowEstimate(false)}>
              <Text style={styles.closeBtnText}>商品選択に戻る</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
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
  bcItem: { fontSize: 12, color: "#c9a84c" },
  bcActive: { fontSize: 12, color: "#9aab9a" },
  content: { padding: 16 },
  listHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  count: { fontSize: 13, color: "#9aab9a" },
  empty: { alignItems: "center", paddingVertical: 48, gap: 12 },
  emptyText: { color: "#9aab9a", fontSize: 14 },
  card: {
    backgroundColor: "#152015",
    borderWidth: 1,
    borderColor: "#2d4a2d",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
  },
  cardActive: { borderColor: "#c9a84c" },
  imgBox: {
    height: 120,
    backgroundColor: "#1e2e1e",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  productImg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  cartBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#c9a84c",
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadgeText: { fontSize: 13, fontWeight: "700", color: "#0d1a0d" },
  pageBadge: {
    position: "absolute",
    bottom: 6,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  pageBadgeText: { fontSize: 10, color: "#9aab9a" },
  cardBody: { padding: 14 },
  modelNo: { fontSize: 10, color: "#9aab9a", letterSpacing: 0.5, marginBottom: 3 },
  productName: { fontSize: 14, fontWeight: "600", color: "#f0ede6", marginBottom: 4 },
  productDesc: { fontSize: 12, color: "#9aab9a", lineHeight: 17, marginBottom: 10 },
  chips: { flexDirection: "row", marginBottom: 12 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginRight: 6,
  },
  chipText: { fontSize: 11 },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  price: { fontSize: 20, fontWeight: "700", color: "#c9a84c" },
  priceSub: { fontSize: 11, color: "#9aab9a" },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#c9a84c",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  addBtnText: { fontSize: 13, fontWeight: "700", color: "#0d1a0d" },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#1e2e1e",
    borderWidth: 1,
    borderColor: "#2d4a2d",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnSm: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: "#1e2e1e",
    borderWidth: 1,
    borderColor: "#2d4a2d",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyNum: { fontSize: 18, fontWeight: "700", color: "#c9a84c", minWidth: 24, textAlign: "center" },
  qtyNumSm: { fontSize: 15, fontWeight: "700", color: "#c9a84c", minWidth: 22, textAlign: "center" },
  floatBar: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: "#1e2e1e",
    borderWidth: 1,
    borderColor: "#c9a84c",
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
  },
  floatCount: { fontSize: 13, color: "#9aab9a" },
  floatBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#c9a84c",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  floatBtnText: { fontSize: 13, fontWeight: "700", color: "#0d1a0d" },
  // Modal
  modal: { flex: 1, backgroundColor: "#152015" },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#2d4a2d",
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#f0ede6" },
  modalScroll: { flex: 1 },
  estimateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    backgroundColor: "#1e2e1e",
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#2d4a2d",
  },
  eName: { fontSize: 13, fontWeight: "600", color: "#f0ede6", marginBottom: 2 },
  eModel: { fontSize: 11, color: "#9aab9a", marginBottom: 2 },
  eUnit: { fontSize: 12, color: "#9aab9a" },
  eRight: { alignItems: "flex-end", gap: 6 },
  eSubtotal: { fontSize: 15, fontWeight: "700", color: "#c9a84c" },
  totalBox: {
    backgroundColor: "#1e2e1e",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#c9a84c",
    marginTop: 8,
    marginBottom: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  totalLabel: { fontSize: 13, color: "#9aab9a" },
  totalValue: { fontSize: 15, color: "#f0ede6", fontWeight: "500" },
  totalFinal: {
    borderTopWidth: 1,
    borderTopColor: "#2d4a2d",
    paddingTop: 10,
    marginTop: 4,
    marginBottom: 0,
  },
  totalFinalLabel: { fontSize: 15, fontWeight: "700", color: "#f0ede6" },
  totalFinalValue: { fontSize: 26, fontWeight: "700", color: "#c9a84c" },
  note: { fontSize: 11, color: "#9aab9a", textAlign: "center" },
  modalFooter: {
    flexDirection: "row",
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#2d4a2d",
  },
  resetBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2d4a2d",
    alignItems: "center",
  },
  resetBtnText: { fontSize: 13, color: "#9aab9a" },
  closeBtn: {
    flex: 2,
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#c9a84c",
    alignItems: "center",
  },
  closeBtnText: { fontSize: 13, fontWeight: "700", color: "#0d1a0d" },
});
