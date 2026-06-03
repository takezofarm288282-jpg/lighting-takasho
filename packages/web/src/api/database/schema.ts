import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  icon: text("icon").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
});

export const locations = sqliteTable("locations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  icon: text("icon").notNull(),
  description: text("description"),
});

export const locationCategories = sqliteTable("location_categories", {
  locationId: integer("location_id").notNull().references(() => locations.id),
  categoryId: integer("category_id").notNull().references(() => categories.id),
});

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  modelNo: text("model_no").notNull(),
  categoryId: integer("category_id").notNull().references(() => categories.id),
  price: integer("price").notNull(),
  lumen: integer("lumen"),
  colorTemp: text("color_temp"), // e.g. "電球色 2700K" / "昼白色 4000K" / "両対応"
  ipRating: text("ip_rating"),   // e.g. "IP65"
  style: text("style"),          // e.g. "モダン" / "ナチュラル" / "クラシック"
  watt: real("watt"),
  imageUrl: text("image_url"),
  catalogPage: integer("catalog_page"),
  description: text("description"),
  features: text("features"),    // JSON array of feature strings
  beamAngle: integer("beam_angle"),    // 照射角度 (degrees) e.g. 30, 60, 120
  reachDistance: real("reach_distance"), // 照射距離 (meters) e.g. 1.5, 3.0, 5.0
  voltage: text("voltage"),              // 電圧: "12V" | "24V" | "100V"
  maker: text("maker").default("TAKASHO"), // メーカー: "TAKASHO" | "LIXIL"
  images: text("images"), // JSON配列 e.g. '["url1","url2","url3"]'
});

export const visitors = sqliteTable("visitors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  postalCode: text("postal_code").notNull(),
  registeredAt: text("registered_at").notNull(), // ISO string
  lastEstimateAt: text("last_estimate_at"),       // 最後に見積した日時
  estimateCount: integer("estimate_count").default(0), // 見積回数
  lastEstimateItems: text("last_estimate_items"), // JSON: [{name, modelNo, price, quantity, subtotal}]
  lastEstimateTotal: integer("last_estimate_total"), // 税別合計
});

export const estimates = sqliteTable("estimates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  visitorId: integer("visitor_id").notNull().references(() => visitors.id),
  locationName: text("location_name"),           // 施工場所名 e.g. "庭・ガーデン"
  items: text("items").notNull(),                // JSON: [{name, modelNo, price, quantity, subtotal}]
  total: integer("total").notNull(),             // 税別合計
  createdAt: text("created_at").notNull(),       // ISO string
});
