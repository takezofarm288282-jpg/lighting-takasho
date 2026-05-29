import { db } from "./index";
import * as schema from "./schema";

async function seed() {
  console.log("🌱 Seeding database...");

  const BASE_IMG = "https://takasho-digitec.jp/lighting/wp-content/themes/takashodigitec_ge/assets/img/site/4100_products_detail";

  // Categories (17種類)
  const categoryData = [
    { name: "ガーデンアップライト", slug: "garden-uplight",   icon: "Flame",                    description: "植栽・樹木を下から照らすアップライト",   imageUrl: `${BASE_IMG}/010/main1.jpg` },
    { name: "ウォールスポットライト", slug: "wall-spotlight",  icon: "Lightbulb",                description: "壁面・外構を照らすスポットライト",       imageUrl: `${BASE_IMG}/003/main1.jpg` },
    { name: "ウォールライト",        slug: "wall-light",      icon: "Lamp",                     description: "外壁・門柱に取り付ける壁面照明",         imageUrl: `${BASE_IMG}/001/main1.jpg` },
    { name: "地中埋込型ライト",      slug: "ground-light",    icon: "Circle",                   description: "地面に埋め込んで使用するライト",         imageUrl: `${BASE_IMG}/005/main1.jpg` },
    { name: "ポールライト",          slug: "pole-light",      icon: "AlignVerticalJustifyCenter",description: "ポールに取り付ける外構照明",             imageUrl: `${BASE_IMG}/008/main1.jpg` },
    { name: "パススタンドライト",    slug: "path-stand-light",icon: "Navigation",               description: "アプローチ・小道を照らすスタンドライト", imageUrl: `${BASE_IMG}/007/main1.jpg` },
    { name: "パスライト",            slug: "path-light",      icon: "Footprints",               description: "足元を照らすローボルトパスライト",       imageUrl: `${BASE_IMG}/009/main1.jpg` },
    { name: "ウォーターライト",      slug: "water-light",     icon: "Waves",                    description: "池・水景を照らす水中ライト",             imageUrl: `${BASE_IMG}/011/main1.jpg` },
    { name: "ダウンライト",          slug: "downlight",       icon: "ChevronDown",              description: "天井・軒下に設置するダウンライト",       imageUrl: `${BASE_IMG}/012/main1.jpg` },
    { name: "レールライト",          slug: "rail-light",      icon: "Minus",                    description: "レール取付け式スポットライト",           imageUrl: `${BASE_IMG}/013/main1.jpg` },
    { name: "デッキライト",          slug: "deck-light",      icon: "Square",                   description: "デッキ・階段に取り付けるライト",         imageUrl: `${BASE_IMG}/014/main1.jpg` },
    { name: "フットライト",          slug: "foot-light",      icon: "Footprints",               description: "足元・階段を照らすフットライト",         imageUrl: `${BASE_IMG}/006/main1.jpg` },
    { name: "門柱灯",                slug: "gate-light",      icon: "Home",                     description: "門柱・門扉に設置する表札灯",             imageUrl: `${BASE_IMG}/002/main1.jpg` },
    { name: "カーポートライト",      slug: "carport-light",   icon: "Car",                      description: "カーポート・車庫を照らす照明",           imageUrl: `${BASE_IMG}/004/main1.jpg` },
    { name: "ソーラーライト",        slug: "solar-light",     icon: "Sun",                      description: "太陽光で充電するソーラー照明",           imageUrl: `${BASE_IMG}/018/main1.jpg` },
    { name: "デコレーションライト",  slug: "decoration-light",icon: "Sparkles",                 description: "庭を彩るイルミネーション照明",           imageUrl: `${BASE_IMG}/015/main1.jpg` },
    { name: "和風ライト",            slug: "japanese-light",  icon: "Landmark",                 description: "和の庭・坪庭に合う和風照明",             imageUrl: `${BASE_IMG}/017/main1.jpg` },
  ];

  await db.delete(schema.locationCategories);
  await db.delete(schema.products);
  await db.delete(schema.categories);
  await db.delete(schema.locations);

  const insertedCategories = await db.insert(schema.categories).values(categoryData).returning();
  const catMap: Record<string, number> = {};
  for (const c of insertedCategories) catMap[c.slug] = c.id;

  // Locations
  const locationData = [
    { name: "玄関・アプローチ", slug: "entrance", icon: "Home",     description: "玄関周り・門柱・アプローチ" },
    { name: "庭・植栽",        slug: "garden",   icon: "Trees",    description: "庭・植栽・芝生エリア" },
    { name: "駐車場・カーポート",slug: "parking", icon: "Car",      description: "駐車場・カーポート" },
    { name: "デッキ・テラス",  slug: "deck",     icon: "Grid3x3",  description: "ウッドデッキ・テラス" },
    { name: "池・ウォーター",  slug: "water",    icon: "Waves",    description: "池・ウォールウォーター・噴水" },
    { name: "フェンス・壁面",  slug: "fence",    icon: "Fence",    description: "フェンス・外壁・塀" },
  ];

  const insertedLocations = await db.insert(schema.locations).values(locationData).returning();
  const locMap: Record<string, number> = {};
  for (const l of insertedLocations) locMap[l.slug] = l.id;

  // Location <-> Category mappings
  const mappings = [
    { location: "entrance", categories: ["wall-spotlight", "wall-light", "gate-light", "sensor-light", "downlight", "path-stand-light", "foot-light"] },
    { location: "garden",   categories: ["garden-uplight", "pole-light", "ground-light", "path-stand-light", "path-light", "decoration-light", "japanese-light", "solar-light"] },
    { location: "parking",  categories: ["pole-light", "carport-light", "downlight", "wall-spotlight"] },
    { location: "deck",     categories: ["deck-light", "downlight", "rail-light", "foot-light"] },
    { location: "water",    categories: ["water-light", "garden-uplight", "ground-light"] },
    { location: "fence",    categories: ["wall-spotlight", "wall-light", "rail-light", "downlight"] },
  ];

  const lcData = [];
  for (const m of mappings) {
    for (const cat of m.categories) {
      if (catMap[cat] && locMap[m.location]) {
        lcData.push({ locationId: locMap[m.location], categoryId: catMap[cat] });
      }
    }
  }
  await db.insert(schema.locationCategories).values(lcData);

  // Products
  const products = [
    // ===== ガーデンアップライト (010) — PDF実型番 =====
    // --- HBB-D78S/C/K (スリムS 狭角) ---
    { name: "ガーデンアップライト スリムS 狭角 シルバー", modelNo: "HBB-D78S", categoryId: catMap["garden-uplight"], price: 14800, lumen: 350, colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 4.0, imageUrl: `${BASE_IMG}/010/main1.jpg`, catalogPage: 34, description: "スリムSボディの狭角ガーデンアップライト。シルバー仕上げ。", features: JSON.stringify(["12V/24V対応", "防雨型IP65", "狭角30°", "スパイク付属"]), beamAngle: 30, reachDistance: 3.0, voltage: "12V" },
    { name: "ガーデンアップライト スリムS 狭角 クリア", modelNo: "HBB-D78C", categoryId: catMap["garden-uplight"], price: 14800, lumen: 350, colorTemp: "昼白色 4000K", ipRating: "IP65", style: "モダン", watt: 4.0, imageUrl: `${BASE_IMG}/010/main1.jpg`, catalogPage: 34, description: "スリムSボディの狭角ガーデンアップライト。クリアレンズ仕上げ。", features: JSON.stringify(["12V/24V対応", "防雨型IP65", "狭角30°", "クリアレンズ"]), beamAngle: 30, reachDistance: 3.0, voltage: "12V" },
    { name: "ガーデンアップライト スリムS 狭角 ブラック", modelNo: "HBB-D78K", categoryId: catMap["garden-uplight"], price: 14800, lumen: 350, colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 4.0, imageUrl: `${BASE_IMG}/010/main1.jpg`, catalogPage: 34, description: "スリムSボディの狭角ガーデンアップライト。ブラック仕上げ。", features: JSON.stringify(["12V/24V対応", "防雨型IP65", "狭角30°", "ブラック"]), beamAngle: 30, reachDistance: 3.0, voltage: "12V" },
    // --- HBB-D66S/C/K (スリムS 広角) ---
    { name: "ガーデンアップライト スリムS 広角 シルバー", modelNo: "HBB-D66S", categoryId: catMap["garden-uplight"], price: 14800, lumen: 400, colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 5.0, imageUrl: `${BASE_IMG}/010/main3.jpg`, catalogPage: 34, description: "スリムSボディの広角ガーデンアップライト。シルバー仕上げ。", features: JSON.stringify(["12V/24V対応", "防雨型IP65", "広角120°", "スパイク付属"]), beamAngle: 120, reachDistance: 2.0, voltage: "12V" },
    { name: "ガーデンアップライト スリムS 広角 クリア", modelNo: "HBB-D66C", categoryId: catMap["garden-uplight"], price: 14800, lumen: 400, colorTemp: "昼白色 4000K", ipRating: "IP65", style: "モダン", watt: 5.0, imageUrl: `${BASE_IMG}/010/main3.jpg`, catalogPage: 34, description: "スリムSボディの広角ガーデンアップライト。クリアレンズ仕上げ。", features: JSON.stringify(["12V/24V対応", "防雨型IP65", "広角120°", "クリアレンズ"]), beamAngle: 120, reachDistance: 2.0, voltage: "12V" },
    { name: "ガーデンアップライト スリムS 広角 ブラック", modelNo: "HBB-D66K", categoryId: catMap["garden-uplight"], price: 14800, lumen: 400, colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 5.0, imageUrl: `${BASE_IMG}/010/main3.jpg`, catalogPage: 34, description: "スリムSボディの広角ガーデンアップライト。ブラック仕上げ。", features: JSON.stringify(["12V/24V対応", "防雨型IP65", "広角120°", "ブラック"]), beamAngle: 120, reachDistance: 2.0, voltage: "12V" },
    // --- HBB-D100K (スリムS 100V) ---
    { name: "ガーデンアップライト スリムS 100V ブラック", modelNo: "HBB-D100K", categoryId: catMap["garden-uplight"], price: 18500, lumen: 600, colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 8.0, imageUrl: `${BASE_IMG}/010/main1.jpg`, catalogPage: 34, description: "100V対応スリムSボディのガーデンアップライト。ブラック仕上げ。", features: JSON.stringify(["100V商用電源", "防雨型IP65", "狭角30°", "ブラック"]), beamAngle: 30, reachDistance: 5.0, voltage: "100V" },
    // --- HBB-D72S/C/K (スタンダード 狭角) ---
    { name: "ガーデンアップライト スタンダード 狭角 シルバー", modelNo: "HBB-D72S", categoryId: catMap["garden-uplight"], price: 17800, lumen: 550, colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 6.0, imageUrl: `${BASE_IMG}/010/main1.jpg`, catalogPage: 35, description: "スタンダードボディの狭角ガーデンアップライト。シルバー仕上げ。", features: JSON.stringify(["12V/24V対応", "防雨型IP65", "狭角25°", "スパイク付属"]), beamAngle: 25, reachDistance: 4.0, voltage: "12V" },
    { name: "ガーデンアップライト スタンダード 狭角 クリア", modelNo: "HBB-D72C", categoryId: catMap["garden-uplight"], price: 17800, lumen: 550, colorTemp: "昼白色 4000K", ipRating: "IP65", style: "モダン", watt: 6.0, imageUrl: `${BASE_IMG}/010/main1.jpg`, catalogPage: 35, description: "スタンダードボディの狭角ガーデンアップライト。クリアレンズ仕上げ。", features: JSON.stringify(["12V/24V対応", "防雨型IP65", "狭角25°", "クリアレンズ"]), beamAngle: 25, reachDistance: 4.0, voltage: "12V" },
    { name: "ガーデンアップライト スタンダード 狭角 ブラック", modelNo: "HBB-D72K", categoryId: catMap["garden-uplight"], price: 17800, lumen: 550, colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 6.0, imageUrl: `${BASE_IMG}/010/main1.jpg`, catalogPage: 35, description: "スタンダードボディの狭角ガーデンアップライト。ブラック仕上げ。", features: JSON.stringify(["12V/24V対応", "防雨型IP65", "狭角25°", "ブラック"]), beamAngle: 25, reachDistance: 4.0, voltage: "12V" },
    // --- HBB-D134K〜D139K (大型 100V 各角度) ---
    { name: "ガーデンアップライト 大型 100V 10° ブラック", modelNo: "HBB-D134K", categoryId: catMap["garden-uplight"], price: 28000, lumen: 1200, colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 14.0, imageUrl: `${BASE_IMG}/010/main1.jpg`, catalogPage: 36, description: "100V大型ガーデンアップライト。超狭角10°。巨木・ランドマーク樹木用。", features: JSON.stringify(["100V商用電源", "防雨型IP65", "超狭角10°", "ブラック"]), beamAngle: 10, reachDistance: 12.0, voltage: "100V" },
    { name: "ガーデンアップライト 大型 100V 20° ブラック", modelNo: "HBB-D135K", categoryId: catMap["garden-uplight"], price: 28000, lumen: 1200, colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 14.0, imageUrl: `${BASE_IMG}/010/main1.jpg`, catalogPage: 36, description: "100V大型ガーデンアップライト。狭角20°。高木スポット照射に。", features: JSON.stringify(["100V商用電源", "防雨型IP65", "狭角20°", "ブラック"]), beamAngle: 20, reachDistance: 10.0, voltage: "100V" },
    { name: "ガーデンアップライト 大型 100V 30° ブラック", modelNo: "HBB-D136K", categoryId: catMap["garden-uplight"], price: 28000, lumen: 1200, colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 14.0, imageUrl: `${BASE_IMG}/010/main1.jpg`, catalogPage: 36, description: "100V大型ガーデンアップライト。スポット30°。高木の全体照射に。", features: JSON.stringify(["100V商用電源", "防雨型IP65", "狭角30°", "ブラック"]), beamAngle: 30, reachDistance: 8.0, voltage: "100V" },
    { name: "ガーデンアップライト 大型 100V 45° ブラック", modelNo: "HBB-D137K", categoryId: catMap["garden-uplight"], price: 28000, lumen: 1200, colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 14.0, imageUrl: `${BASE_IMG}/010/main1.jpg`, catalogPage: 36, description: "100V大型ガーデンアップライト。中角45°。中高木ウォッシュに。", features: JSON.stringify(["100V商用電源", "防雨型IP65", "中角45°", "ブラック"]), beamAngle: 45, reachDistance: 6.0, voltage: "100V" },
    { name: "ガーデンアップライト 大型 100V 60° ブラック", modelNo: "HBB-D138K", categoryId: catMap["garden-uplight"], price: 28000, lumen: 1200, colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 14.0, imageUrl: `${BASE_IMG}/010/main3.jpg`, catalogPage: 36, description: "100V大型ガーデンアップライト。中角60°。広範囲の植栽演出に。", features: JSON.stringify(["100V商用電源", "防雨型IP65", "中角60°", "ブラック"]), beamAngle: 60, reachDistance: 5.0, voltage: "100V" },
    { name: "ガーデンアップライト 大型 100V 90° ブラック", modelNo: "HBB-D139K", categoryId: catMap["garden-uplight"], price: 28000, lumen: 1200, colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 14.0, imageUrl: `${BASE_IMG}/010/main3.jpg`, catalogPage: 36, description: "100V大型ガーデンアップライト。広角120°。樹木全体ウォッシュ照射に。", features: JSON.stringify(["100V商用電源", "防雨型IP65", "広角120°", "ブラック"]), beamAngle: 120, reachDistance: 4.0, voltage: "100V" },
    // --- HBB-D155K (大型 100V 高出力) ---
    { name: "ガーデンアップライト 大型ハイパワー 100V ブラック", modelNo: "HBB-D155K", categoryId: catMap["garden-uplight"], price: 38000, lumen: 2000, colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 20.0, imageUrl: `${BASE_IMG}/010/main1.jpg`, catalogPage: 37, description: "超高輝度2000lm。大型公共植栽・巨木の圧倒的な照明演出に。", features: JSON.stringify(["100V商用電源", "防雨型IP65", "狭角20°", "超高輝度2000lm", "ブラック"]), beamAngle: 20, reachDistance: 15.0, voltage: "100V" },
    // --- HBB-D157K (大型 100V 広角ハイパワー) ---
    { name: "ガーデンアップライト 大型広角ハイパワー 100V ブラック", modelNo: "HBB-D157K", categoryId: catMap["garden-uplight"], price: 38000, lumen: 2000, colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 20.0, imageUrl: `${BASE_IMG}/010/main3.jpg`, catalogPage: 37, description: "超高輝度2000lm広角タイプ。巨木・大面積植栽を広くウォッシュ照射。", features: JSON.stringify(["100V商用電源", "防雨型IP65", "広角120°", "超高輝度2000lm", "ブラック"]), beamAngle: 120, reachDistance: 10.0, voltage: "100V" },
    // --- HBB-D147C/K (スポットライトタイプ) ---
    { name: "ガーデンアップライト スポット クリア", modelNo: "HBB-D147C", categoryId: catMap["garden-uplight"], price: 19800, lumen: 700, colorTemp: "昼白色 4000K", ipRating: "IP65", style: "モダン", watt: 8.0, imageUrl: `${BASE_IMG}/010/main1.jpg`, catalogPage: 38, description: "クリアレンズスポットタイプのガーデンアップライト。", features: JSON.stringify(["12V/24V対応", "防雨型IP65", "狭角20°", "クリアレンズ"]), beamAngle: 20, reachDistance: 5.0, voltage: "24V" },
    { name: "ガーデンアップライト スポット ブラック", modelNo: "HBB-D147K", categoryId: catMap["garden-uplight"], price: 19800, lumen: 700, colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 8.0, imageUrl: `${BASE_IMG}/010/main1.jpg`, catalogPage: 38, description: "ブラックボディのスポットタイプガーデンアップライト。", features: JSON.stringify(["12V/24V対応", "防雨型IP65", "狭角20°", "ブラック"]), beamAngle: 20, reachDistance: 5.0, voltage: "24V" },
    // --- HBB-D95C (広角クリア) ---
    { name: "ガーデンアップライト 広角 クリア", modelNo: "HBB-D95C", categoryId: catMap["garden-uplight"], price: 22000, lumen: 900, colorTemp: "昼白色 4000K", ipRating: "IP65", style: "モダン", watt: 10.0, imageUrl: `${BASE_IMG}/010/main3.jpg`, catalogPage: 38, description: "広角クリアレンズタイプのガーデンアップライト。植栽エリア全体を均一に照射。", features: JSON.stringify(["12V/24V対応", "防雨型IP65", "広角120°", "クリアレンズ"]), beamAngle: 120, reachDistance: 3.0, voltage: "24V" },
    // --- HBA-D51C/K (壁面取付アップライト) ---
    { name: "ガーデンアップライト 壁面取付 クリア", modelNo: "HBA-D51C", categoryId: catMap["garden-uplight"], price: 24800, lumen: 800, colorTemp: "昼白色 4000K", ipRating: "IP65", style: "モダン", watt: 9.0, imageUrl: `${BASE_IMG}/010/main1.jpg`, catalogPage: 39, description: "壁面取付タイプの大型アップライト。クリアレンズ。高木への高さのある照射に。", features: JSON.stringify(["100V商用電源", "防雨型IP65", "狭角30°", "壁面取付", "クリアレンズ"]), beamAngle: 30, reachDistance: 7.0, voltage: "100V" },
    { name: "ガーデンアップライト 壁面取付 ブラック", modelNo: "HBA-D51K", categoryId: catMap["garden-uplight"], price: 24800, lumen: 800, colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 9.0, imageUrl: `${BASE_IMG}/010/main1.jpg`, catalogPage: 39, description: "壁面取付タイプの大型アップライト。ブラック。高木への高さのある照射に。", features: JSON.stringify(["100V商用電源", "防雨型IP65", "狭角30°", "壁面取付", "ブラック"]), beamAngle: 30, reachDistance: 7.0, voltage: "100V" },
    // --- HBA-D41S/K (コンパクト壁面取付) ---
    { name: "ガーデンアップライト コンパクト壁面 シルバー", modelNo: "HBA-D41S", categoryId: catMap["garden-uplight"], price: 16800, lumen: 450, colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 5.0, imageUrl: `${BASE_IMG}/010/main1.jpg`, catalogPage: 39, description: "コンパクト壁面取付タイプのアップライト。シルバー。", features: JSON.stringify(["100V商用電源", "防雨型IP65", "狭角25°", "壁面取付", "シルバー"]), beamAngle: 25, reachDistance: 4.0, voltage: "100V" },
    { name: "ガーデンアップライト コンパクト壁面 ブラック", modelNo: "HBA-D41K", categoryId: catMap["garden-uplight"], price: 16800, lumen: 450, colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 5.0, imageUrl: `${BASE_IMG}/010/main1.jpg`, catalogPage: 39, description: "コンパクト壁面取付タイプのアップライト。ブラック。", features: JSON.stringify(["100V商用電源", "防雨型IP65", "狭角25°", "壁面取付", "ブラック"]), beamAngle: 25, reachDistance: 4.0, voltage: "100V" },

    // ===== ウォールスポットライト (003) — PDF実型番 HBA-D41S/K + 12V/24V補完 =====
    // HBA-D41S/K はgarden-uplightとwall-spotlight両方に掲載（壁面取付スポット）
    // 100V
    { name: "ウォールスポットライト シルバー 100V", modelNo: "HBA-D41S", categoryId: catMap["wall-spotlight"], price: 16800, lumen: 450, colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 5.0, imageUrl: `${BASE_IMG}/003/main1.jpg`, catalogPage: 34, description: "壁面取付タイプのスポットライト。シルバー仕上げ。100V。", features: JSON.stringify(["100V商用電源", "防雨型IP65", "狭角25°", "首振り機能", "シルバー"]), beamAngle: 25, reachDistance: 4.0, voltage: "100V" },
    { name: "ウォールスポットライト ブラック 100V", modelNo: "HBA-D41K", categoryId: catMap["wall-spotlight"], price: 16800, lumen: 450, colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 5.0, imageUrl: `${BASE_IMG}/003/main1.jpg`, catalogPage: 34, description: "壁面取付タイプのスポットライト。ブラック仕上げ。100V。", features: JSON.stringify(["100V商用電源", "防雨型IP65", "狭角25°", "首振り機能", "ブラック"]), beamAngle: 25, reachDistance: 4.0, voltage: "100V" },
    // 12V（ローボルト対応）
    { name: "ウォールスポットライト シルバー 12V", modelNo: "HBA-D41S", categoryId: catMap["wall-spotlight"], price: 14800, lumen: 280, colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 3.0, imageUrl: `${BASE_IMG}/003/main1.jpg`, catalogPage: 34, description: "壁面取付タイプのスポットライト。シルバー仕上げ。12Vローボルト。", features: JSON.stringify(["12Vローボルト", "防雨型IP65", "狭角25°", "首振り機能", "シルバー"]), beamAngle: 25, reachDistance: 3.0, voltage: "12V" },
    { name: "ウォールスポットライト ブラック 12V", modelNo: "HBA-D41K", categoryId: catMap["wall-spotlight"], price: 14800, lumen: 280, colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 3.0, imageUrl: `${BASE_IMG}/003/main1.jpg`, catalogPage: 34, description: "壁面取付タイプのスポットライト。ブラック仕上げ。12Vローボルト。", features: JSON.stringify(["12Vローボルト", "防雨型IP65", "狭角25°", "首振り機能", "ブラック"]), beamAngle: 25, reachDistance: 3.0, voltage: "12V" },
    // 24V（ローボルト中圧対応）
    { name: "ウォールスポットライト シルバー 24V", modelNo: "HBA-D41S", categoryId: catMap["wall-spotlight"], price: 15800, lumen: 380, colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 4.0, imageUrl: `${BASE_IMG}/003/main1.jpg`, catalogPage: 34, description: "壁面取付タイプのスポットライト。シルバー仕上げ。24Vローボルト。", features: JSON.stringify(["24Vローボルト", "防雨型IP65", "狭角25°", "首振り機能", "シルバー"]), beamAngle: 25, reachDistance: 5.0, voltage: "24V" },
    { name: "ウォールスポットライト ブラック 24V", modelNo: "HBA-D41K", categoryId: catMap["wall-spotlight"], price: 15800, lumen: 380, colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 4.0, imageUrl: `${BASE_IMG}/003/main1.jpg`, catalogPage: 34, description: "壁面取付タイプのスポットライト。ブラック仕上げ。24Vローボルト。", features: JSON.stringify(["24Vローボルト", "防雨型IP65", "狭角25°", "首振り機能", "ブラック"]), beamAngle: 25, reachDistance: 5.0, voltage: "24V" },
    // 広角バリアント（ウォッシュ照射タイプ）
    { name: "ウォールスポットライト 広角 シルバー 12V", modelNo: "HBA-D41S", categoryId: catMap["wall-spotlight"], price: 14800, lumen: 280, colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 3.0, imageUrl: `${BASE_IMG}/003/main3.jpg`, catalogPage: 34, description: "壁面取付タイプの広角スポットライト。シルバー仕上げ。12V。植栽エリアをウォッシュ。", features: JSON.stringify(["12Vローボルト", "防雨型IP65", "広角120°", "首振り機能", "シルバー"]), beamAngle: 120, reachDistance: 2.0, voltage: "12V" },
    { name: "ウォールスポットライト 広角 ブラック 12V", modelNo: "HBA-D41K", categoryId: catMap["wall-spotlight"], price: 14800, lumen: 280, colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 3.0, imageUrl: `${BASE_IMG}/003/main3.jpg`, catalogPage: 34, description: "壁面取付タイプの広角スポットライト。ブラック仕上げ。12V。植栽エリアをウォッシュ。", features: JSON.stringify(["12Vローボルト", "防雨型IP65", "広角120°", "首振り機能", "ブラック"]), beamAngle: 120, reachDistance: 2.0, voltage: "12V" },
    { name: "ウォールスポットライト 広角 シルバー 24V", modelNo: "HBA-D41S", categoryId: catMap["wall-spotlight"], price: 15800, lumen: 380, colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 4.0, imageUrl: `${BASE_IMG}/003/main3.jpg`, catalogPage: 34, description: "壁面取付タイプの広角スポットライト。シルバー仕上げ。24V。", features: JSON.stringify(["24Vローボルト", "防雨型IP65", "広角120°", "首振り機能", "シルバー"]), beamAngle: 120, reachDistance: 3.0, voltage: "24V" },
    { name: "ウォールスポットライト 広角 ブラック 24V", modelNo: "HBA-D41K", categoryId: catMap["wall-spotlight"], price: 15800, lumen: 380, colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 4.0, imageUrl: `${BASE_IMG}/003/main3.jpg`, catalogPage: 34, description: "壁面取付タイプの広角スポットライト。ブラック仕上げ。24V。", features: JSON.stringify(["24Vローボルト", "防雨型IP65", "広角120°", "首振り機能", "ブラック"]), beamAngle: 120, reachDistance: 3.0, voltage: "24V" },
    { name: "ウォールスポットライト 広角 シルバー 100V", modelNo: "HBA-D41S", categoryId: catMap["wall-spotlight"], price: 16800, lumen: 450, colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 5.0, imageUrl: `${BASE_IMG}/003/main3.jpg`, catalogPage: 34, description: "壁面取付タイプの広角スポットライト。シルバー仕上げ。100V。", features: JSON.stringify(["100V商用電源", "防雨型IP65", "広角120°", "首振り機能", "シルバー"]), beamAngle: 120, reachDistance: 4.0, voltage: "100V" },
    { name: "ウォールスポットライト 広角 ブラック 100V", modelNo: "HBA-D41K", categoryId: catMap["wall-spotlight"], price: 16800, lumen: 450, colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 5.0, imageUrl: `${BASE_IMG}/003/main3.jpg`, catalogPage: 34, description: "壁面取付タイプの広角スポットライト。ブラック仕上げ。100V。", features: JSON.stringify(["100V商用電源", "防雨型IP65", "広角120°", "首振り機能", "ブラック"]), beamAngle: 120, reachDistance: 4.0, voltage: "100V" },

    // ===== ウォールライト (001) — PDF実型番 HBG系 =====
    { name: "ウォールライト スクエア シルバー", modelNo: "HBG-D02S", categoryId: catMap["wall-light"], price: 12800, lumen: 400, colorTemp: "電球色 2700K", ipRating: "IP54", style: "モダン", watt: 5.0, imageUrl: `${BASE_IMG}/001/main1.jpg`, catalogPage: 40, description: "スクエアデザインのLEDウォールライト。シルバー仕上げ。外壁・門柱に。", features: JSON.stringify(["防雨型IP54", "スクエア型", "上下配光", "シルバー"]), beamAngle: 120, reachDistance: 2.0 },
    { name: "ウォールライト スクエア ブラック", modelNo: "HBG-D02K", categoryId: catMap["wall-light"], price: 12800, lumen: 400, colorTemp: "電球色 2700K", ipRating: "IP54", style: "モダン", watt: 5.0, imageUrl: `${BASE_IMG}/001/main1.jpg`, catalogPage: 40, description: "スクエアデザインのLEDウォールライト。ブラック仕上げ。外壁・門柱に。", features: JSON.stringify(["防雨型IP54", "スクエア型", "上下配光", "ブラック"]), beamAngle: 120, reachDistance: 2.0 },
    { name: "ウォールライト ラウンド シルバー", modelNo: "HBG-D13S", categoryId: catMap["wall-light"], price: 13800, lumen: 450, colorTemp: "電球色 2700K", ipRating: "IP54", style: "クラシック", watt: 6.0, imageUrl: `${BASE_IMG}/001/main3.jpg`, catalogPage: 40, description: "ラウンドデザインのLEDウォールライト。シルバー仕上げ。", features: JSON.stringify(["防雨型IP54", "丸型デザイン", "全方向配光", "シルバー"]), beamAngle: 180, reachDistance: 2.5 },
    { name: "ウォールライト ラウンド ブラック", modelNo: "HBG-D13K", categoryId: catMap["wall-light"], price: 13800, lumen: 450, colorTemp: "電球色 2700K", ipRating: "IP54", style: "クラシック", watt: 6.0, imageUrl: `${BASE_IMG}/001/main3.jpg`, catalogPage: 40, description: "ラウンドデザインのLEDウォールライト。ブラック仕上げ。", features: JSON.stringify(["防雨型IP54", "丸型デザイン", "全方向配光", "ブラック"]), beamAngle: 180, reachDistance: 2.5 },
    { name: "ウォールライト スリム シルバー", modelNo: "HBG-D01S", categoryId: catMap["wall-light"], price: 11800, lumen: 350, colorTemp: "電球色 2700K", ipRating: "IP54", style: "モダン", watt: 4.0, imageUrl: `${BASE_IMG}/001/main5.jpg`, catalogPage: 40, description: "スリムボディのLEDウォールライト。シルバー仕上げ。", features: JSON.stringify(["防雨型IP54", "スリム型", "下方向配光", "シルバー"]), beamAngle: 90, reachDistance: 1.5 },
    { name: "ウォールライト スリム ブラック", modelNo: "HBG-D01K", categoryId: catMap["wall-light"], price: 11800, lumen: 350, colorTemp: "電球色 2700K", ipRating: "IP54", style: "モダン", watt: 4.0, imageUrl: `${BASE_IMG}/001/main5.jpg`, catalogPage: 40, description: "スリムボディのLEDウォールライト。ブラック仕上げ。", features: JSON.stringify(["防雨型IP54", "スリム型", "下方向配光", "ブラック"]), beamAngle: 90, reachDistance: 1.5 },
    { name: "ウォールライト ワイド シルバー", modelNo: "HBG-D12S", categoryId: catMap["wall-light"], price: 14800, lumen: 600, colorTemp: "電球色 2700K", ipRating: "IP54", style: "モダン", watt: 7.0, imageUrl: `${BASE_IMG}/001/main1.jpg`, catalogPage: 40, description: "ワイド配光のLEDウォールライト。シルバー仕上げ。広いエントランスに。", features: JSON.stringify(["防雨型IP54", "ワイド型", "広角配光", "シルバー"]), beamAngle: 150, reachDistance: 3.5 },
    { name: "ウォールライト ワイド ブラック", modelNo: "HBG-D12K", categoryId: catMap["wall-light"], price: 14800, lumen: 600, colorTemp: "電球色 2700K", ipRating: "IP54", style: "モダン", watt: 7.0, imageUrl: `${BASE_IMG}/001/main1.jpg`, catalogPage: 40, description: "ワイド配光のLEDウォールライト。ブラック仕上げ。広いエントランスに。", features: JSON.stringify(["防雨型IP54", "ワイド型", "広角配光", "ブラック"]), beamAngle: 150, reachDistance: 3.5 },

    // ===== 地中埋込型ライト (005) =====
    // ── オルテック XS (180lm) ──
    { name: "オルテック XS 狭角 12V", modelNo: "HBD-D53S", categoryId: catMap["ground-light"], price: 32000, lumen: 180, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 3.0, imageUrl: `${BASE_IMG}/005/main1.jpg`, catalogPage: 106, description: "コンパクトなXSサイズのオルテック狭角タイプ（12V）", features: JSON.stringify(["IP67防水", "ステンレスカバー", "強化ガラス"]), beamAngle: 25, reachDistance: 1.2, voltage: "12V" },
    { name: "オルテック XS 狭角 24V", modelNo: "HBD-D53S", categoryId: catMap["ground-light"], price: 32000, lumen: 180, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 3.0, imageUrl: `${BASE_IMG}/005/main1.jpg`, catalogPage: 106, description: "コンパクトなXSサイズのオルテック狭角タイプ（24V）", features: JSON.stringify(["IP67防水", "ステンレスカバー", "強化ガラス"]), beamAngle: 25, reachDistance: 1.2, voltage: "24V" },
    { name: "オルテック XS 狭角 100V", modelNo: "HBD-D53S", categoryId: catMap["ground-light"], price: 32000, lumen: 180, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 3.0, imageUrl: `${BASE_IMG}/005/main1.jpg`, catalogPage: 106, description: "コンパクトなXSサイズのオルテック狭角タイプ（100V）", features: JSON.stringify(["IP67防水", "ステンレスカバー", "強化ガラス"]), beamAngle: 25, reachDistance: 1.2, voltage: "100V" },
    { name: "オルテック XS 広角 12V", modelNo: "HBD-D51S", categoryId: catMap["ground-light"], price: 32000, lumen: 180, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 3.0, imageUrl: `${BASE_IMG}/005/main1.jpg`, catalogPage: 106, description: "コンパクトなXSサイズのオルテック広角タイプ（12V）", features: JSON.stringify(["IP67防水", "広角照射", "強化ガラス"]), beamAngle: 120, reachDistance: 2.0, voltage: "12V" },
    { name: "オルテック XS 広角 24V", modelNo: "HBD-D51S", categoryId: catMap["ground-light"], price: 32000, lumen: 180, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 3.0, imageUrl: `${BASE_IMG}/005/main1.jpg`, catalogPage: 106, description: "コンパクトなXSサイズのオルテック広角タイプ（24V）", features: JSON.stringify(["IP67防水", "広角照射", "強化ガラス"]), beamAngle: 120, reachDistance: 2.0, voltage: "24V" },
    { name: "オルテック XS 広角 100V", modelNo: "HBD-D51S", categoryId: catMap["ground-light"], price: 32000, lumen: 180, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 3.0, imageUrl: `${BASE_IMG}/005/main1.jpg`, catalogPage: 106, description: "コンパクトなXSサイズのオルテック広角タイプ（100V）", features: JSON.stringify(["IP67防水", "広角照射", "強化ガラス"]), beamAngle: 120, reachDistance: 2.0, voltage: "100V" },

    // ── オルテック S (400lm) ──
    { name: "オルテック S 狭角 12V", modelNo: "HBD-D41S", categoryId: catMap["ground-light"], price: 39000, lumen: 400, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 5.0, imageUrl: `${BASE_IMG}/005/main1.jpg`, catalogPage: 107, description: "標準Sサイズのオルテック狭角タイプ（12V）", features: JSON.stringify(["IP67防水", "ステンレスカバー", "強化ガラス"]), beamAngle: 25, reachDistance: 1.8, voltage: "12V" },
    { name: "オルテック S 狭角 24V", modelNo: "HBD-D41S", categoryId: catMap["ground-light"], price: 39000, lumen: 400, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 5.0, imageUrl: `${BASE_IMG}/005/main1.jpg`, catalogPage: 107, description: "標準Sサイズのオルテック狭角タイプ（24V）", features: JSON.stringify(["IP67防水", "ステンレスカバー", "強化ガラス"]), beamAngle: 25, reachDistance: 1.8, voltage: "24V" },
    { name: "オルテック S 狭角 100V", modelNo: "HBD-D41S", categoryId: catMap["ground-light"], price: 39000, lumen: 400, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 5.0, imageUrl: `${BASE_IMG}/005/main1.jpg`, catalogPage: 107, description: "標準Sサイズのオルテック狭角タイプ（100V）", features: JSON.stringify(["IP67防水", "ステンレスカバー", "強化ガラス"]), beamAngle: 25, reachDistance: 1.8, voltage: "100V" },
    { name: "オルテック S 広角 12V", modelNo: "HBD-D27S", categoryId: catMap["ground-light"], price: 39000, lumen: 400, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 5.0, imageUrl: `${BASE_IMG}/005/main1.jpg`, catalogPage: 107, description: "標準Sサイズのオルテック広角タイプ（12V）", features: JSON.stringify(["IP67防水", "広角照射", "強化ガラス"]), beamAngle: 120, reachDistance: 3.0, voltage: "12V" },
    { name: "オルテック S 広角 24V", modelNo: "HBD-D27S", categoryId: catMap["ground-light"], price: 39000, lumen: 400, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 5.0, imageUrl: `${BASE_IMG}/005/main1.jpg`, catalogPage: 107, description: "標準Sサイズのオルテック広角タイプ（24V）", features: JSON.stringify(["IP67防水", "広角照射", "強化ガラス"]), beamAngle: 120, reachDistance: 3.0, voltage: "24V" },
    { name: "オルテック S 広角 100V", modelNo: "HBD-D27S", categoryId: catMap["ground-light"], price: 39000, lumen: 400, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 5.0, imageUrl: `${BASE_IMG}/005/main1.jpg`, catalogPage: 107, description: "標準Sサイズのオルテック広角タイプ（100V）", features: JSON.stringify(["IP67防水", "広角照射", "強化ガラス"]), beamAngle: 120, reachDistance: 3.0, voltage: "100V" },

    // ── オルテック M (600lm) ──
    { name: "オルテック M 狭角 12V", modelNo: "HBD-D42S", categoryId: catMap["ground-light"], price: 44000, lumen: 600, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 7.0, imageUrl: `${BASE_IMG}/005/main1.jpg`, catalogPage: 108, description: "中型Mサイズのオルテック狭角タイプ（12V）", features: JSON.stringify(["IP67防水", "ステンレスカバー", "強化ガラス"]), beamAngle: 25, reachDistance: 2.2, voltage: "12V" },
    { name: "オルテック M 狭角 24V", modelNo: "HBD-D42S", categoryId: catMap["ground-light"], price: 44000, lumen: 600, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 7.0, imageUrl: `${BASE_IMG}/005/main1.jpg`, catalogPage: 108, description: "中型Mサイズのオルテック狭角タイプ（24V）", features: JSON.stringify(["IP67防水", "ステンレスカバー", "強化ガラス"]), beamAngle: 25, reachDistance: 2.2, voltage: "24V" },
    { name: "オルテック M 狭角 100V", modelNo: "HBD-D42S", categoryId: catMap["ground-light"], price: 44000, lumen: 600, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 7.0, imageUrl: `${BASE_IMG}/005/main1.jpg`, catalogPage: 108, description: "中型Mサイズのオルテック狭角タイプ（100V）", features: JSON.stringify(["IP67防水", "ステンレスカバー", "強化ガラス"]), beamAngle: 25, reachDistance: 2.2, voltage: "100V" },
    { name: "オルテック M 広角 12V", modelNo: "HBD-D28S", categoryId: catMap["ground-light"], price: 44000, lumen: 600, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 7.0, imageUrl: `${BASE_IMG}/005/main1.jpg`, catalogPage: 108, description: "中型Mサイズのオルテック広角タイプ（12V）", features: JSON.stringify(["IP67防水", "広角照射", "強化ガラス"]), beamAngle: 120, reachDistance: 3.5, voltage: "12V" },
    { name: "オルテック M 広角 24V", modelNo: "HBD-D28S", categoryId: catMap["ground-light"], price: 44000, lumen: 600, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 7.0, imageUrl: `${BASE_IMG}/005/main1.jpg`, catalogPage: 108, description: "中型Mサイズのオルテック広角タイプ（24V）", features: JSON.stringify(["IP67防水", "広角照射", "強化ガラス"]), beamAngle: 120, reachDistance: 3.5, voltage: "24V" },
    { name: "オルテック M 広角 100V", modelNo: "HBD-D28S", categoryId: catMap["ground-light"], price: 44000, lumen: 600, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 7.0, imageUrl: `${BASE_IMG}/005/main1.jpg`, catalogPage: 108, description: "中型Mサイズのオルテック広角タイプ（100V）", features: JSON.stringify(["IP67防水", "広角照射", "強化ガラス"]), beamAngle: 120, reachDistance: 3.5, voltage: "100V" },

    // ── オルテック L (1000lm) ──
    { name: "オルテック L 狭角 12V", modelNo: "HBD-D43S", categoryId: catMap["ground-light"], price: 65000, lumen: 1000, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 11.0, imageUrl: `${BASE_IMG}/005/main1.jpg`, catalogPage: 109, description: "大型Lサイズのオルテック狭角タイプ（12V）", features: JSON.stringify(["IP67防水", "ステンレスカバー", "強化ガラス"]), beamAngle: 25, reachDistance: 3.0, voltage: "12V" },
    { name: "オルテック L 狭角 24V", modelNo: "HBD-D43S", categoryId: catMap["ground-light"], price: 65000, lumen: 1000, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 11.0, imageUrl: `${BASE_IMG}/005/main1.jpg`, catalogPage: 109, description: "大型Lサイズのオルテック狭角タイプ（24V）", features: JSON.stringify(["IP67防水", "ステンレスカバー", "強化ガラス"]), beamAngle: 25, reachDistance: 3.0, voltage: "24V" },
    { name: "オルテック L 狭角 100V", modelNo: "HBD-D43S", categoryId: catMap["ground-light"], price: 65000, lumen: 1000, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 11.0, imageUrl: `${BASE_IMG}/005/main1.jpg`, catalogPage: 109, description: "大型Lサイズのオルテック狭角タイプ（100V）", features: JSON.stringify(["IP67防水", "ステンレスカバー", "強化ガラス"]), beamAngle: 25, reachDistance: 3.0, voltage: "100V" },
    { name: "オルテック L 中角 12V", modelNo: "HBD-D29S", categoryId: catMap["ground-light"], price: 65000, lumen: 1000, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 11.0, imageUrl: `${BASE_IMG}/005/main1.jpg`, catalogPage: 109, description: "大型Lサイズのオルテック中角タイプ（12V）", features: JSON.stringify(["IP67防水", "中角照射", "強化ガラス"]), beamAngle: 60, reachDistance: 2.5, voltage: "12V" },
    { name: "オルテック L 中角 24V", modelNo: "HBD-D29S", categoryId: catMap["ground-light"], price: 65000, lumen: 1000, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 11.0, imageUrl: `${BASE_IMG}/005/main1.jpg`, catalogPage: 109, description: "大型Lサイズのオルテック中角タイプ（24V）", features: JSON.stringify(["IP67防水", "中角照射", "強化ガラス"]), beamAngle: 60, reachDistance: 2.5, voltage: "24V" },
    { name: "オルテック L 中角 100V", modelNo: "HBD-D29S", categoryId: catMap["ground-light"], price: 65000, lumen: 1000, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 11.0, imageUrl: `${BASE_IMG}/005/main1.jpg`, catalogPage: 109, description: "大型Lサイズのオルテック中角タイプ（100V）", features: JSON.stringify(["IP67防水", "中角照射", "強化ガラス"]), beamAngle: 60, reachDistance: 2.5, voltage: "100V" },

    // ── グランドオルテック グレアカット XS ──
    { name: "グランドオルテック グレアカット XS 狭角 12V", modelNo: "HBD-D54S", categoryId: catMap["ground-light"], price: 33000, lumen: 180, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 3.0, imageUrl: `${BASE_IMG}/005/main2.jpg`, catalogPage: 110, description: "グレアカット付きXSサイズ狭角タイプ（12V）", features: JSON.stringify(["IP67防水", "グレアカット", "ステンレスカバー"]), beamAngle: 25, reachDistance: 1.2, voltage: "12V" },
    { name: "グランドオルテック グレアカット XS 狭角 24V", modelNo: "HBD-D54S", categoryId: catMap["ground-light"], price: 33000, lumen: 180, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 3.0, imageUrl: `${BASE_IMG}/005/main2.jpg`, catalogPage: 110, description: "グレアカット付きXSサイズ狭角タイプ（24V）", features: JSON.stringify(["IP67防水", "グレアカット", "ステンレスカバー"]), beamAngle: 25, reachDistance: 1.2, voltage: "24V" },
    { name: "グランドオルテック グレアカット XS 狭角 100V", modelNo: "HBD-D54S", categoryId: catMap["ground-light"], price: 33000, lumen: 180, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 3.0, imageUrl: `${BASE_IMG}/005/main2.jpg`, catalogPage: 110, description: "グレアカット付きXSサイズ狭角タイプ（100V）", features: JSON.stringify(["IP67防水", "グレアカット", "ステンレスカバー"]), beamAngle: 25, reachDistance: 1.2, voltage: "100V" },
    { name: "グランドオルテック グレアカット XS 広角 12V", modelNo: "HBD-D52S", categoryId: catMap["ground-light"], price: 33000, lumen: 180, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 3.0, imageUrl: `${BASE_IMG}/005/main2.jpg`, catalogPage: 110, description: "グレアカット付きXSサイズ広角タイプ（12V）", features: JSON.stringify(["IP67防水", "グレアカット", "広角照射"]), beamAngle: 120, reachDistance: 2.0, voltage: "12V" },
    { name: "グランドオルテック グレアカット XS 広角 24V", modelNo: "HBD-D52S", categoryId: catMap["ground-light"], price: 33000, lumen: 180, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 3.0, imageUrl: `${BASE_IMG}/005/main2.jpg`, catalogPage: 110, description: "グレアカット付きXSサイズ広角タイプ（24V）", features: JSON.stringify(["IP67防水", "グレアカット", "広角照射"]), beamAngle: 120, reachDistance: 2.0, voltage: "24V" },
    { name: "グランドオルテック グレアカット XS 広角 100V", modelNo: "HBD-D52S", categoryId: catMap["ground-light"], price: 33000, lumen: 180, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 3.0, imageUrl: `${BASE_IMG}/005/main2.jpg`, catalogPage: 110, description: "グレアカット付きXSサイズ広角タイプ（100V）", features: JSON.stringify(["IP67防水", "グレアカット", "広角照射"]), beamAngle: 120, reachDistance: 2.0, voltage: "100V" },

    // ── グランドオルテック グレアカット S ──
    { name: "グランドオルテック グレアカット S 狭角 12V", modelNo: "HBD-D44S", categoryId: catMap["ground-light"], price: 40000, lumen: 400, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 5.0, imageUrl: `${BASE_IMG}/005/main2.jpg`, catalogPage: 111, description: "グレアカット付きSサイズ狭角タイプ（12V）", features: JSON.stringify(["IP67防水", "グレアカット", "ステンレスカバー"]), beamAngle: 25, reachDistance: 1.8, voltage: "12V" },
    { name: "グランドオルテック グレアカット S 狭角 24V", modelNo: "HBD-D44S", categoryId: catMap["ground-light"], price: 40000, lumen: 400, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 5.0, imageUrl: `${BASE_IMG}/005/main2.jpg`, catalogPage: 111, description: "グレアカット付きSサイズ狭角タイプ（24V）", features: JSON.stringify(["IP67防水", "グレアカット", "ステンレスカバー"]), beamAngle: 25, reachDistance: 1.8, voltage: "24V" },
    { name: "グランドオルテック グレアカット S 狭角 100V", modelNo: "HBD-D44S", categoryId: catMap["ground-light"], price: 40000, lumen: 400, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 5.0, imageUrl: `${BASE_IMG}/005/main2.jpg`, catalogPage: 111, description: "グレアカット付きSサイズ狭角タイプ（100V）", features: JSON.stringify(["IP67防水", "グレアカット", "ステンレスカバー"]), beamAngle: 25, reachDistance: 1.8, voltage: "100V" },
    { name: "グランドオルテック グレアカット S 広角 12V", modelNo: "HBD-D30S", categoryId: catMap["ground-light"], price: 40000, lumen: 400, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 5.0, imageUrl: `${BASE_IMG}/005/main2.jpg`, catalogPage: 111, description: "グレアカット付きSサイズ広角タイプ（12V）", features: JSON.stringify(["IP67防水", "グレアカット", "広角照射"]), beamAngle: 120, reachDistance: 3.0, voltage: "12V" },
    { name: "グランドオルテック グレアカット S 広角 24V", modelNo: "HBD-D30S", categoryId: catMap["ground-light"], price: 40000, lumen: 400, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 5.0, imageUrl: `${BASE_IMG}/005/main2.jpg`, catalogPage: 111, description: "グレアカット付きSサイズ広角タイプ（24V）", features: JSON.stringify(["IP67防水", "グレアカット", "広角照射"]), beamAngle: 120, reachDistance: 3.0, voltage: "24V" },
    { name: "グランドオルテック グレアカット S 広角 100V", modelNo: "HBD-D30S", categoryId: catMap["ground-light"], price: 40000, lumen: 400, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 5.0, imageUrl: `${BASE_IMG}/005/main2.jpg`, catalogPage: 111, description: "グレアカット付きSサイズ広角タイプ（100V）", features: JSON.stringify(["IP67防水", "グレアカット", "広角照射"]), beamAngle: 120, reachDistance: 3.0, voltage: "100V" },

    // ── グランドオルテック グレアカット M ──
    { name: "グランドオルテック グレアカット M 狭角 12V", modelNo: "HBD-D45S", categoryId: catMap["ground-light"], price: 45000, lumen: 600, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 7.0, imageUrl: `${BASE_IMG}/005/main2.jpg`, catalogPage: 111, description: "グレアカット付きMサイズ狭角タイプ（12V）", features: JSON.stringify(["IP67防水", "グレアカット", "ステンレスカバー"]), beamAngle: 25, reachDistance: 2.2, voltage: "12V" },
    { name: "グランドオルテック グレアカット M 狭角 24V", modelNo: "HBD-D45S", categoryId: catMap["ground-light"], price: 45000, lumen: 600, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 7.0, imageUrl: `${BASE_IMG}/005/main2.jpg`, catalogPage: 111, description: "グレアカット付きMサイズ狭角タイプ（24V）", features: JSON.stringify(["IP67防水", "グレアカット", "ステンレスカバー"]), beamAngle: 25, reachDistance: 2.2, voltage: "24V" },
    { name: "グランドオルテック グレアカット M 狭角 100V", modelNo: "HBD-D45S", categoryId: catMap["ground-light"], price: 45000, lumen: 600, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 7.0, imageUrl: `${BASE_IMG}/005/main2.jpg`, catalogPage: 111, description: "グレアカット付きMサイズ狭角タイプ（100V）", features: JSON.stringify(["IP67防水", "グレアカット", "ステンレスカバー"]), beamAngle: 25, reachDistance: 2.2, voltage: "100V" },
    { name: "グランドオルテック グレアカット M 広角 12V", modelNo: "HBD-D31S", categoryId: catMap["ground-light"], price: 45000, lumen: 600, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 7.0, imageUrl: `${BASE_IMG}/005/main2.jpg`, catalogPage: 111, description: "グレアカット付きMサイズ広角タイプ（12V）", features: JSON.stringify(["IP67防水", "グレアカット", "広角照射"]), beamAngle: 120, reachDistance: 3.5, voltage: "12V" },
    { name: "グランドオルテック グレアカット M 広角 24V", modelNo: "HBD-D31S", categoryId: catMap["ground-light"], price: 45000, lumen: 600, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 7.0, imageUrl: `${BASE_IMG}/005/main2.jpg`, catalogPage: 111, description: "グレアカット付きMサイズ広角タイプ（24V）", features: JSON.stringify(["IP67防水", "グレアカット", "広角照射"]), beamAngle: 120, reachDistance: 3.5, voltage: "24V" },
    { name: "グランドオルテック グレアカット M 広角 100V", modelNo: "HBD-D31S", categoryId: catMap["ground-light"], price: 45000, lumen: 600, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 7.0, imageUrl: `${BASE_IMG}/005/main2.jpg`, catalogPage: 111, description: "グレアカット付きMサイズ広角タイプ（100V）", features: JSON.stringify(["IP67防水", "グレアカット", "広角照射"]), beamAngle: 120, reachDistance: 3.5, voltage: "100V" },

    // ── グランドオルテック グレアカット L ──
    { name: "グランドオルテック グレアカット L 狭角 12V", modelNo: "HBD-D46S", categoryId: catMap["ground-light"], price: 66000, lumen: 1000, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 11.0, imageUrl: `${BASE_IMG}/005/main2.jpg`, catalogPage: 111, description: "グレアカット付きLサイズ狭角タイプ（12V）", features: JSON.stringify(["IP67防水", "グレアカット", "ステンレスカバー"]), beamAngle: 25, reachDistance: 3.0, voltage: "12V" },
    { name: "グランドオルテック グレアカット L 狭角 24V", modelNo: "HBD-D46S", categoryId: catMap["ground-light"], price: 66000, lumen: 1000, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 11.0, imageUrl: `${BASE_IMG}/005/main2.jpg`, catalogPage: 111, description: "グレアカット付きLサイズ狭角タイプ（24V）", features: JSON.stringify(["IP67防水", "グレアカット", "ステンレスカバー"]), beamAngle: 25, reachDistance: 3.0, voltage: "24V" },
    { name: "グランドオルテック グレアカット L 狭角 100V", modelNo: "HBD-D46S", categoryId: catMap["ground-light"], price: 66000, lumen: 1000, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 11.0, imageUrl: `${BASE_IMG}/005/main2.jpg`, catalogPage: 111, description: "グレアカット付きLサイズ狭角タイプ（100V）", features: JSON.stringify(["IP67防水", "グレアカット", "ステンレスカバー"]), beamAngle: 25, reachDistance: 3.0, voltage: "100V" },
    { name: "グランドオルテック グレアカット L 中角 12V", modelNo: "HBD-D32S", categoryId: catMap["ground-light"], price: 66000, lumen: 1000, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 11.0, imageUrl: `${BASE_IMG}/005/main2.jpg`, catalogPage: 111, description: "グレアカット付きLサイズ中角タイプ（12V）", features: JSON.stringify(["IP67防水", "グレアカット", "中角照射"]), beamAngle: 60, reachDistance: 2.5, voltage: "12V" },
    { name: "グランドオルテック グレアカット L 中角 24V", modelNo: "HBD-D32S", categoryId: catMap["ground-light"], price: 66000, lumen: 1000, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 11.0, imageUrl: `${BASE_IMG}/005/main2.jpg`, catalogPage: 111, description: "グレアカット付きLサイズ中角タイプ（24V）", features: JSON.stringify(["IP67防水", "グレアカット", "中角照射"]), beamAngle: 60, reachDistance: 2.5, voltage: "24V" },
    { name: "グランドオルテック グレアカット L 中角 100V", modelNo: "HBD-D32S", categoryId: catMap["ground-light"], price: 66000, lumen: 1000, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 11.0, imageUrl: `${BASE_IMG}/005/main2.jpg`, catalogPage: 111, description: "グレアカット付きLサイズ中角タイプ（100V）", features: JSON.stringify(["IP67防水", "グレアカット", "中角照射"]), beamAngle: 60, reachDistance: 2.5, voltage: "100V" },

    // ── オルテック ユニバーサル S ──
    { name: "オルテック ユニバーサル S 狭角 12V", modelNo: "HBD-D33S", categoryId: catMap["ground-light"], price: 56000, lumen: 400, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 5.0, imageUrl: `${BASE_IMG}/005/main3.jpg`, catalogPage: 113, description: "ユニバーサルタイプSサイズ狭角（12V）。向きを自在に調整可能", features: JSON.stringify(["IP67防水", "首振り調整", "ユニバーサル"]), beamAngle: 25, reachDistance: 1.8, voltage: "12V" },
    { name: "オルテック ユニバーサル S 狭角 24V", modelNo: "HBD-D33S", categoryId: catMap["ground-light"], price: 56000, lumen: 400, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 5.0, imageUrl: `${BASE_IMG}/005/main3.jpg`, catalogPage: 113, description: "ユニバーサルタイプSサイズ狭角（24V）。向きを自在に調整可能", features: JSON.stringify(["IP67防水", "首振り調整", "ユニバーサル"]), beamAngle: 25, reachDistance: 1.8, voltage: "24V" },
    { name: "オルテック ユニバーサル S 狭角 100V", modelNo: "HBD-D33S", categoryId: catMap["ground-light"], price: 56000, lumen: 400, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 5.0, imageUrl: `${BASE_IMG}/005/main3.jpg`, catalogPage: 113, description: "ユニバーサルタイプSサイズ狭角（100V）。向きを自在に調整可能", features: JSON.stringify(["IP67防水", "首振り調整", "ユニバーサル"]), beamAngle: 25, reachDistance: 1.8, voltage: "100V" },
    { name: "オルテック ユニバーサル S 広角 12V", modelNo: "HBD-D35S", categoryId: catMap["ground-light"], price: 57000, lumen: 400, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 5.0, imageUrl: `${BASE_IMG}/005/main3.jpg`, catalogPage: 113, description: "ユニバーサルタイプSサイズ広角（12V）。向きを自在に調整可能", features: JSON.stringify(["IP67防水", "首振り調整", "広角照射"]), beamAngle: 120, reachDistance: 3.0, voltage: "12V" },
    { name: "オルテック ユニバーサル S 広角 24V", modelNo: "HBD-D35S", categoryId: catMap["ground-light"], price: 57000, lumen: 400, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 5.0, imageUrl: `${BASE_IMG}/005/main3.jpg`, catalogPage: 113, description: "ユニバーサルタイプSサイズ広角（24V）。向きを自在に調整可能", features: JSON.stringify(["IP67防水", "首振り調整", "広角照射"]), beamAngle: 120, reachDistance: 3.0, voltage: "24V" },
    { name: "オルテック ユニバーサル S 広角 100V", modelNo: "HBD-D35S", categoryId: catMap["ground-light"], price: 57000, lumen: 400, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 5.0, imageUrl: `${BASE_IMG}/005/main3.jpg`, catalogPage: 113, description: "ユニバーサルタイプSサイズ広角（100V）。向きを自在に調整可能", features: JSON.stringify(["IP67防水", "首振り調整", "広角照射"]), beamAngle: 120, reachDistance: 3.0, voltage: "100V" },

    // ── オルテック ユニバーサル M ──
    { name: "オルテック ユニバーサル M 狭角 12V", modelNo: "HBD-D34S", categoryId: catMap["ground-light"], price: 61000, lumen: 600, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 7.0, imageUrl: `${BASE_IMG}/005/main3.jpg`, catalogPage: 113, description: "ユニバーサルタイプMサイズ狭角（12V）。向きを自在に調整可能", features: JSON.stringify(["IP67防水", "首振り調整", "ユニバーサル"]), beamAngle: 25, reachDistance: 2.2, voltage: "12V" },
    { name: "オルテック ユニバーサル M 狭角 24V", modelNo: "HBD-D34S", categoryId: catMap["ground-light"], price: 61000, lumen: 600, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 7.0, imageUrl: `${BASE_IMG}/005/main3.jpg`, catalogPage: 113, description: "ユニバーサルタイプMサイズ狭角（24V）。向きを自在に調整可能", features: JSON.stringify(["IP67防水", "首振り調整", "ユニバーサル"]), beamAngle: 25, reachDistance: 2.2, voltage: "24V" },
    { name: "オルテック ユニバーサル M 狭角 100V", modelNo: "HBD-D34S", categoryId: catMap["ground-light"], price: 61000, lumen: 600, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 7.0, imageUrl: `${BASE_IMG}/005/main3.jpg`, catalogPage: 113, description: "ユニバーサルタイプMサイズ狭角（100V）。向きを自在に調整可能", features: JSON.stringify(["IP67防水", "首振り調整", "ユニバーサル"]), beamAngle: 25, reachDistance: 2.2, voltage: "100V" },
    { name: "オルテック ユニバーサル M 広角 12V", modelNo: "HBD-D36S", categoryId: catMap["ground-light"], price: 62000, lumen: 600, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 7.0, imageUrl: `${BASE_IMG}/005/main3.jpg`, catalogPage: 113, description: "ユニバーサルタイプMサイズ広角（12V）。向きを自在に調整可能", features: JSON.stringify(["IP67防水", "首振り調整", "広角照射"]), beamAngle: 120, reachDistance: 3.5, voltage: "12V" },
    { name: "オルテック ユニバーサル M 広角 24V", modelNo: "HBD-D36S", categoryId: catMap["ground-light"], price: 62000, lumen: 600, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 7.0, imageUrl: `${BASE_IMG}/005/main3.jpg`, catalogPage: 113, description: "ユニバーサルタイプMサイズ広角（24V）。向きを自在に調整可能", features: JSON.stringify(["IP67防水", "首振り調整", "広角照射"]), beamAngle: 120, reachDistance: 3.5, voltage: "24V" },
    { name: "オルテック ユニバーサル M 広角 100V", modelNo: "HBD-D36S", categoryId: catMap["ground-light"], price: 62000, lumen: 600, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 7.0, imageUrl: `${BASE_IMG}/005/main3.jpg`, catalogPage: 113, description: "ユニバーサルタイプMサイズ広角（100V）。向きを自在に調整可能", features: JSON.stringify(["IP67防水", "首振り調整", "広角照射"]), beamAngle: 120, reachDistance: 3.5, voltage: "100V" },

    // ── スタンドタイプ ──
    { name: "スタンドタイプ 110lm 12V", modelNo: "HBD-D39S", categoryId: catMap["ground-light"], price: 42000, lumen: 110, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 2.0, imageUrl: `${BASE_IMG}/005/main4.jpg`, catalogPage: 114, description: "地上に突き出すスタンドタイプのグラウンドライト（12V）", features: JSON.stringify(["IP67防水", "スタンド型", "ステンレス"]), beamAngle: 25, reachDistance: 1.5, voltage: "12V" },
    { name: "スタンドタイプ 110lm 24V", modelNo: "HBD-D39C", categoryId: catMap["ground-light"], price: 42000, lumen: 110, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 2.0, imageUrl: `${BASE_IMG}/005/main4.jpg`, catalogPage: 114, description: "地上に突き出すスタンドタイプのグラウンドライト（24V）", features: JSON.stringify(["IP67防水", "スタンド型", "ステンレス"]), beamAngle: 25, reachDistance: 1.5, voltage: "24V" },
    { name: "スタンドタイプ 110lm 黒 12V", modelNo: "HBD-D39K", categoryId: catMap["ground-light"], price: 42000, lumen: 110, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 2.0, imageUrl: `${BASE_IMG}/005/main4.jpg`, catalogPage: 114, description: "地上に突き出すスタンドタイプのグラウンドライト ブラック（12V）", features: JSON.stringify(["IP67防水", "スタンド型", "ブラック"]), beamAngle: 25, reachDistance: 1.5, voltage: "12V" },
    { name: "スタンドタイプ 250lm 12V", modelNo: "HBD-D40S", categoryId: catMap["ground-light"], price: 44000, lumen: 250, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 3.5, imageUrl: `${BASE_IMG}/005/main4.jpg`, catalogPage: 114, description: "地上に突き出すスタンドタイプのグラウンドライト 250lm（12V）", features: JSON.stringify(["IP67防水", "スタンド型", "高輝度"]), beamAngle: 25, reachDistance: 2.0, voltage: "12V" },
    { name: "スタンドタイプ 250lm 24V", modelNo: "HBD-D40C", categoryId: catMap["ground-light"], price: 44000, lumen: 250, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 3.5, imageUrl: `${BASE_IMG}/005/main4.jpg`, catalogPage: 114, description: "地上に突き出すスタンドタイプのグラウンドライト 250lm（24V）", features: JSON.stringify(["IP67防水", "スタンド型", "高輝度"]), beamAngle: 25, reachDistance: 2.0, voltage: "24V" },
    { name: "スタンドタイプ 250lm 黒 12V", modelNo: "HBD-D40K", categoryId: catMap["ground-light"], price: 44000, lumen: 250, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 3.5, imageUrl: `${BASE_IMG}/005/main4.jpg`, catalogPage: 114, description: "地上に突き出すスタンドタイプのグラウンドライト 250lm ブラック（12V）", features: JSON.stringify(["IP67防水", "スタンド型", "ブラック"]), beamAngle: 25, reachDistance: 2.0, voltage: "12V" },

    // ── フラットライトラスト ──
    { name: "フラットライトラスト 12V", modelNo: "HBD-D55S", categoryId: catMap["ground-light"], price: 28000, lumen: 20, colorTemp: "電球色 2700K", ipRating: "IP67", style: "ナチュラル", watt: 1.0, imageUrl: `${BASE_IMG}/005/main5.jpg`, catalogPage: 115, description: "フラット薄型デザインのラストカラーグラウンドライト（12V）", features: JSON.stringify(["IP67防水", "フラット薄型", "ラスト仕上げ"]), beamAngle: 120, reachDistance: 1.0, voltage: "12V" },
    { name: "フラットライトラスト 24V", modelNo: "HBD-W55S", categoryId: catMap["ground-light"], price: 28000, lumen: 20, colorTemp: "電球色 2700K", ipRating: "IP67", style: "ナチュラル", watt: 1.0, imageUrl: `${BASE_IMG}/005/main5.jpg`, catalogPage: 115, description: "フラット薄型デザインのラストカラーグラウンドライト（24V）", features: JSON.stringify(["IP67防水", "フラット薄型", "ラスト仕上げ"]), beamAngle: 120, reachDistance: 1.0, voltage: "24V" },
    { name: "フラットライトラスト 黒 12V", modelNo: "HBD-B55S", categoryId: catMap["ground-light"], price: 28000, lumen: 20, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 1.0, imageUrl: `${BASE_IMG}/005/main5.jpg`, catalogPage: 115, description: "フラット薄型デザインのブラックグラウンドライト（12V）", features: JSON.stringify(["IP67防水", "フラット薄型", "ブラック"]), beamAngle: 120, reachDistance: 1.0, voltage: "12V" },

    // ── フロストタイプ ──
    { name: "フロストタイプ 12V", modelNo: "HBD-W23S", categoryId: catMap["ground-light"], price: 23000, lumen: 20, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 1.0, imageUrl: `${BASE_IMG}/005/main6.jpg`, catalogPage: 116, description: "フロストガラスで柔らかい光を演出するグラウンドライト（12V）", features: JSON.stringify(["IP67防水", "フロストガラス", "拡散光"]), beamAngle: 180, reachDistance: 0.8, voltage: "12V" },
    { name: "フロストタイプ 黒 12V", modelNo: "HBD-B23S", categoryId: catMap["ground-light"], price: 23000, lumen: 20, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 1.0, imageUrl: `${BASE_IMG}/005/main6.jpg`, catalogPage: 116, description: "フロストガラスで柔らかい光を演出するグラウンドライト ブラック（12V）", features: JSON.stringify(["IP67防水", "フロストガラス", "ブラック"]), beamAngle: 180, reachDistance: 0.8, voltage: "12V" },

    // ── 側面配光タイプ ──
    { name: "側面配光タイプ 72lm 12V", modelNo: "HBD-B24S", categoryId: catMap["ground-light"], price: 28000, lumen: 72, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 2.0, imageUrl: `${BASE_IMG}/005/main7.jpg`, catalogPage: 116, description: "側面方向に光を配光するグラウンドライト（12V）", features: JSON.stringify(["IP67防水", "側面配光", "スリット発光"]), beamAngle: 90, reachDistance: 1.5, voltage: "12V" },
    { name: "側面配光タイプ 10lm 12V", modelNo: "HBD-D19S", categoryId: catMap["ground-light"], price: 51000, lumen: 10, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 1.0, imageUrl: `${BASE_IMG}/005/main7.jpg`, catalogPage: 117, description: "コンパクト側面配光タイプ（12V）", features: JSON.stringify(["IP67防水", "側面配光", "ミニサイズ"]), beamAngle: 90, reachDistance: 0.8, voltage: "12V" },
    { name: "側面配光タイプ 10lm 24V", modelNo: "HBD-D19S", categoryId: catMap["ground-light"], price: 51000, lumen: 10, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 1.0, imageUrl: `${BASE_IMG}/005/main7.jpg`, catalogPage: 117, description: "コンパクト側面配光タイプ（24V）", features: JSON.stringify(["IP67防水", "側面配光", "ミニサイズ"]), beamAngle: 90, reachDistance: 0.8, voltage: "24V" },
    { name: "側面配光タイプ 35lm 12V", modelNo: "HBD-D20S", categoryId: catMap["ground-light"], price: 53000, lumen: 35, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 2.0, imageUrl: `${BASE_IMG}/005/main7.jpg`, catalogPage: 117, description: "中型側面配光タイプ（12V）", features: JSON.stringify(["IP67防水", "側面配光", "踏圧対応"]), beamAngle: 90, reachDistance: 1.2, voltage: "12V" },
    { name: "側面配光タイプ 35lm 24V", modelNo: "HBD-D20S", categoryId: catMap["ground-light"], price: 53000, lumen: 35, colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 2.0, imageUrl: `${BASE_IMG}/005/main7.jpg`, catalogPage: 117, description: "中型側面配光タイプ（24V）", features: JSON.stringify(["IP67防水", "側面配光", "踏圧対応"]), beamAngle: 90, reachDistance: 1.2, voltage: "24V" },

    // ===== ポールライト (008) — PDF実型番 HBC-D87S/CH/K他, HFD-D94S =====
    { name: "ポールライト スタンダード シルバー H800", modelNo: "HBC-D87S", categoryId: catMap["pole-light"], price: 29800, lumen: 900, colorTemp: "電球色 2700K", ipRating: "IP54", style: "モダン", watt: 9.0, imageUrl: `${BASE_IMG}/008/main1.jpg`, catalogPage: 41, description: "スタンダードタイプLEDポールライト。高さ800mm。シルバー仕上げ。", features: JSON.stringify(["防雨型IP54", "高さ800mm", "アルミ製", "シルバー"]), beamAngle: 360, reachDistance: 3.0 },
    { name: "ポールライト スタンダード シャンパン H800", modelNo: "HBC-D87CH", categoryId: catMap["pole-light"], price: 29800, lumen: 900, colorTemp: "電球色 2700K", ipRating: "IP54", style: "クラシック", watt: 9.0, imageUrl: `${BASE_IMG}/008/main1.jpg`, catalogPage: 41, description: "スタンダードタイプLEDポールライト。高さ800mm。シャンパン仕上げ。", features: JSON.stringify(["防雨型IP54", "高さ800mm", "アルミ製", "シャンパン"]), beamAngle: 360, reachDistance: 3.0 },
    { name: "ポールライト スタンダード ブラック H800", modelNo: "HBC-D87K", categoryId: catMap["pole-light"], price: 29800, lumen: 900, colorTemp: "電球色 2700K", ipRating: "IP54", style: "モダン", watt: 9.0, imageUrl: `${BASE_IMG}/008/main1.jpg`, catalogPage: 41, description: "スタンダードタイプLEDポールライト。高さ800mm。ブラック仕上げ。", features: JSON.stringify(["防雨型IP54", "高さ800mm", "アルミ製", "ブラック"]), beamAngle: 360, reachDistance: 3.0 },
    { name: "ポールライト ファインスクエア H940", modelNo: "HFD-D94S", categoryId: catMap["pole-light"], price: 34800, lumen: 1100, colorTemp: "電球色 2700K", ipRating: "IP54", style: "モダン", watt: 11.0, imageUrl: `${BASE_IMG}/008/main4.jpg`, catalogPage: 42, description: "スクエアヘッドのファインタイプポールライト。高さ940mm。", features: JSON.stringify(["防雨型IP54", "高さ940mm", "スクエアヘッド", "シルバー"]), beamAngle: 360, reachDistance: 4.0 },

    // ===== パススタンドライト (007) — PDF実型番 HBF系, HBA-D08系 =====
    { name: "パススタンドライト スリム ブラック H350", modelNo: "HBF-D35K", categoryId: catMap["path-stand-light"], price: 9800, lumen: 150, colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 3.0, imageUrl: `${BASE_IMG}/007/main1.jpg`, catalogPage: 43, description: "スリムボディのパススタンドライト。高さ350mm。ブラック仕上げ。", features: JSON.stringify(["防雨型IP65", "高さ350mm", "スパイク付属", "ブラック"]), beamAngle: 120, reachDistance: 1.5 },
    { name: "パススタンドライト スタンダード シルバー H260", modelNo: "HBF-D26S", categoryId: catMap["path-stand-light"], price: 8500, lumen: 120, colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 2.5, imageUrl: `${BASE_IMG}/007/main1.jpg`, catalogPage: 43, description: "スタンダードタイプパススタンドライト。高さ260mm。シルバー仕上げ。", features: JSON.stringify(["防雨型IP65", "高さ260mm", "スパイク付属", "シルバー"]), beamAngle: 120, reachDistance: 1.2 },
    { name: "パススタンドライト スタンダード クリア H260", modelNo: "HBF-D26C", categoryId: catMap["path-stand-light"], price: 8500, lumen: 120, colorTemp: "昼白色 4000K", ipRating: "IP65", style: "モダン", watt: 2.5, imageUrl: `${BASE_IMG}/007/main1.jpg`, catalogPage: 43, description: "スタンダードタイプパススタンドライト。高さ260mm。クリアレンズ仕上げ。", features: JSON.stringify(["防雨型IP65", "高さ260mm", "スパイク付属", "クリア"]), beamAngle: 120, reachDistance: 1.2 },
    { name: "パススタンドライト ラウンド クリア H420", modelNo: "HBF-D42C", categoryId: catMap["path-stand-light"], price: 11800, lumen: 200, colorTemp: "昼白色 4000K", ipRating: "IP65", style: "クラシック", watt: 4.0, imageUrl: `${BASE_IMG}/007/main4.jpg`, catalogPage: 43, description: "ラウンドグローブタイプ。高さ420mm。クリアレンズ仕上げ。", features: JSON.stringify(["防雨型IP65", "高さ420mm", "ラウンド型", "クリア"]), beamAngle: 180, reachDistance: 2.0 },
    { name: "パススタンドライト ラウンド ブラック H420", modelNo: "HBF-D42K", categoryId: catMap["path-stand-light"], price: 11800, lumen: 200, colorTemp: "電球色 2700K", ipRating: "IP65", style: "クラシック", watt: 4.0, imageUrl: `${BASE_IMG}/007/main4.jpg`, catalogPage: 43, description: "ラウンドグローブタイプ。高さ420mm。ブラック仕上げ。", features: JSON.stringify(["防雨型IP65", "高さ420mm", "ラウンド型", "ブラック"]), beamAngle: 180, reachDistance: 2.0 },
    { name: "パススタンドライト スリムハイ ブラック H430", modelNo: "HBF-D43K", categoryId: catMap["path-stand-light"], price: 12800, lumen: 250, colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 5.0, imageUrl: `${BASE_IMG}/007/main7.jpg`, catalogPage: 43, description: "スリムハイタイプのパススタンドライト。高さ430mm。ブラック仕上げ。", features: JSON.stringify(["防雨型IP65", "高さ430mm", "スリムハイ", "ブラック"]), beamAngle: 120, reachDistance: 2.0 },
    { name: "パススタンドライト ルミナスL クリア", modelNo: "HBF-D10L", categoryId: catMap["path-stand-light"], price: 7800, lumen: 100, colorTemp: "電球色 2700K", ipRating: "IP65", style: "ナチュラル", watt: 2.0, imageUrl: `${BASE_IMG}/007/main1.jpg`, catalogPage: 43, description: "ルミナスシリーズLサイズ。クリア仕上げ。", features: JSON.stringify(["防雨型IP65", "スパイク付属", "ルミナスL", "クリア"]), beamAngle: 150, reachDistance: 1.5 },
    { name: "パススタンドライト ルミナスL クリア2", modelNo: "HBF-D10C", categoryId: catMap["path-stand-light"], price: 7800, lumen: 100, colorTemp: "昼白色 4000K", ipRating: "IP65", style: "ナチュラル", watt: 2.0, imageUrl: `${BASE_IMG}/007/main1.jpg`, catalogPage: 43, description: "ルミナスシリーズLサイズ。昼白色クリア仕上げ。", features: JSON.stringify(["防雨型IP65", "スパイク付属", "ルミナスL", "昼白色"]), beamAngle: 150, reachDistance: 1.5 },
    { name: "パススタンドライト ルミナスS クリア", modelNo: "HBF-D11L", categoryId: catMap["path-stand-light"], price: 6800, lumen: 80, colorTemp: "電球色 2700K", ipRating: "IP65", style: "ナチュラル", watt: 1.5, imageUrl: `${BASE_IMG}/007/main1.jpg`, catalogPage: 43, description: "ルミナスシリーズSサイズ。クリア仕上げ。コンパクトで取り付けやすい。", features: JSON.stringify(["防雨型IP65", "スパイク付属", "ルミナスS", "クリア"]), beamAngle: 150, reachDistance: 1.0 },
    { name: "パススタンドライト ルミナスS クリア2", modelNo: "HBF-D11C", categoryId: catMap["path-stand-light"], price: 6800, lumen: 80, colorTemp: "昼白色 4000K", ipRating: "IP65", style: "ナチュラル", watt: 1.5, imageUrl: `${BASE_IMG}/007/main1.jpg`, catalogPage: 43, description: "ルミナスシリーズSサイズ。昼白色クリア仕上げ。", features: JSON.stringify(["防雨型IP65", "スパイク付属", "ルミナスS", "昼白色"]), beamAngle: 150, reachDistance: 1.0 },
    { name: "パススタンドライト ルミナスワイド L クリア", modelNo: "HBA-D08L", categoryId: catMap["path-stand-light"], price: 9800, lumen: 130, colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 3.0, imageUrl: `${BASE_IMG}/007/main4.jpg`, catalogPage: 43, description: "ルミナスワイドシリーズLサイズ。クリア。幅広い照射エリア。", features: JSON.stringify(["防雨型IP65", "スパイク付属", "ワイド配光", "クリア"]), beamAngle: 180, reachDistance: 2.0 },
    { name: "パススタンドライト ルミナスワイド G クリア", modelNo: "HBA-D08G", categoryId: catMap["path-stand-light"], price: 9800, lumen: 130, colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 3.0, imageUrl: `${BASE_IMG}/007/main4.jpg`, catalogPage: 43, description: "ルミナスワイドシリーズGサイズ。クリア。", features: JSON.stringify(["防雨型IP65", "スパイク付属", "ワイド配光", "クリアG"]), beamAngle: 180, reachDistance: 2.0 },
    { name: "パススタンドライト ルミナスワイド D クリア", modelNo: "HBA-D08D", categoryId: catMap["path-stand-light"], price: 9800, lumen: 130, colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 3.0, imageUrl: `${BASE_IMG}/007/main4.jpg`, catalogPage: 43, description: "ルミナスワイドシリーズDサイズ。クリア。", features: JSON.stringify(["防雨型IP65", "スパイク付属", "ワイド配光", "クリアD"]), beamAngle: 180, reachDistance: 2.0 },

    // ===== パスライト (009) =====
    {
      name: "LEDパスライト 丸型", modelNo: "HPL-R02L",
      categoryId: catMap["path-light"], price: 3800, lumen: 80,
      colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 2.0,
      imageUrl: `${BASE_IMG}/009/main1.jpg`, catalogPage: 210,
      description: "足元を柔らかく照らす丸型パスライト",
      features: JSON.stringify(["防雨型IP65", "スパイク付属", "360度配光"]),
      beamAngle: 360, reachDistance: 1.0,
    },
    {
      name: "LEDパスライト 角型", modelNo: "HPL-S02L",
      categoryId: catMap["path-light"], price: 4200, lumen: 100,
      colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 2.0,
      imageUrl: `${BASE_IMG}/009/main3.jpg`, catalogPage: 212,
      description: "スクエアデザインのパスライト",
      features: JSON.stringify(["防雨型IP65", "スパイク付属", "スクエアデザイン"]),
      beamAngle: 270, reachDistance: 1.0,
    },

    // ===== ウォーターライト (011) — PDF実型番 HHA系 =====
    { name: "ウォーターライト 水中用 シルバー 12V 17W", modelNo: "HHA-D17S", categoryId: catMap["water-light"], price: 38000, lumen: 800, colorTemp: "電球色 2700K", ipRating: "IP68", style: "モダン", watt: 17.0, imageUrl: `${BASE_IMG}/011/main1.jpg`, catalogPage: 44, description: "池・水景を演出する水中ライト。シルバーボディ。12V。17W。", features: JSON.stringify(["完全防水IP68", "水中使用可", "ステンレス", "シルバー"]), beamAngle: 30, reachDistance: 2.0 },
    { name: "ウォーターライト 水中用 ホワイト 12V 17W", modelNo: "HHA-W17S", categoryId: catMap["water-light"], price: 38000, lumen: 800, colorTemp: "電球色 2700K", ipRating: "IP68", style: "モダン", watt: 17.0, imageUrl: `${BASE_IMG}/011/main1.jpg`, catalogPage: 44, description: "池・水景を演出する水中ライト。ホワイトボディ。12V。17W。", features: JSON.stringify(["完全防水IP68", "水中使用可", "ステンレス", "ホワイト"]), beamAngle: 30, reachDistance: 2.0 },
    { name: "ウォーターライト 水中用 シルバー 12V 20W", modelNo: "HHA-D20S", categoryId: catMap["water-light"], price: 42000, lumen: 1000, colorTemp: "電球色 2700K", ipRating: "IP68", style: "モダン", watt: 20.0, imageUrl: `${BASE_IMG}/011/main1.jpg`, catalogPage: 44, description: "池・水景を演出する水中ライト。シルバーボディ。12V。20W高輝度。", features: JSON.stringify(["完全防水IP68", "水中使用可", "ステンレス", "高輝度"]), beamAngle: 30, reachDistance: 2.5 },
    { name: "ウォーターライト 水中用 ホワイト 12V 20W", modelNo: "HHA-W20S", categoryId: catMap["water-light"], price: 42000, lumen: 1000, colorTemp: "電球色 2700K", ipRating: "IP68", style: "モダン", watt: 20.0, imageUrl: `${BASE_IMG}/011/main1.jpg`, catalogPage: 44, description: "池・水景を演出する水中ライト。ホワイトボディ。12V。20W高輝度。", features: JSON.stringify(["完全防水IP68", "水中使用可", "ステンレス", "高輝度"]), beamAngle: 30, reachDistance: 2.5 },
    { name: "ウォーターライト 水中用 シルバー 12V 25W", modelNo: "HHA-D25S", categoryId: catMap["water-light"], price: 48000, lumen: 1400, colorTemp: "電球色 2700K", ipRating: "IP68", style: "モダン", watt: 25.0, imageUrl: `${BASE_IMG}/011/main1.jpg`, catalogPage: 44, description: "大型池・水景用高輝度水中ライト。シルバー。25W。", features: JSON.stringify(["完全防水IP68", "水中使用可", "大型池対応", "高輝度"]), beamAngle: 60, reachDistance: 3.0 },
    { name: "ウォーターライト 水中用 ホワイト 12V 25W", modelNo: "HHA-W25S", categoryId: catMap["water-light"], price: 48000, lumen: 1400, colorTemp: "電球色 2700K", ipRating: "IP68", style: "モダン", watt: 25.0, imageUrl: `${BASE_IMG}/011/main1.jpg`, catalogPage: 44, description: "大型池・水景用高輝度水中ライト。ホワイト。25W。", features: JSON.stringify(["完全防水IP68", "水中使用可", "大型池対応", "高輝度"]), beamAngle: 60, reachDistance: 3.0 },
    { name: "ウォーターライト 水中用 シルバー 12V 30W", modelNo: "HHA-D30S", categoryId: catMap["water-light"], price: 56000, lumen: 1800, colorTemp: "電球色 2700K", ipRating: "IP68", style: "モダン", watt: 30.0, imageUrl: `${BASE_IMG}/011/main1.jpg`, catalogPage: 44, description: "超高輝度水中ライト。シルバー。30W。", features: JSON.stringify(["完全防水IP68", "水中使用可", "超高輝度", "シルバー"]), beamAngle: 60, reachDistance: 4.0 },
    { name: "ウォーターライト 水中用 ホワイト 12V 30W", modelNo: "HHA-W30S", categoryId: catMap["water-light"], price: 56000, lumen: 1800, colorTemp: "電球色 2700K", ipRating: "IP68", style: "モダン", watt: 30.0, imageUrl: `${BASE_IMG}/011/main1.jpg`, catalogPage: 44, description: "超高輝度水中ライト。ホワイト。30W。", features: JSON.stringify(["完全防水IP68", "水中使用可", "超高輝度", "ホワイト"]), beamAngle: 60, reachDistance: 4.0 },

    // ===== ダウンライト (012) =====
    {
      name: "LEDアウトドアダウンライト φ100", modelNo: "HDD-D05L",
      categoryId: catMap["downlight"], price: 9800, lumen: 450,
      colorTemp: "電球色 2700K", ipRating: "IP54", style: "モダン", watt: 5.0,
      imageUrl: `${BASE_IMG}/012/main1.jpg`, catalogPage: 290,
      description: "軒下・ポーチ天井に設置するアウトドアダウンライト",
      features: JSON.stringify(["防雨型IP54", "φ100mm", "埋込取付"]),
      beamAngle: 60, reachDistance: 2.0,
    },
    {
      name: "LEDアウトドアダウンライト φ150", modelNo: "HDD-D08L",
      categoryId: catMap["downlight"], price: 13500, lumen: 700,
      colorTemp: "電球色 2700K", ipRating: "IP54", style: "モダン", watt: 8.0,
      imageUrl: `${BASE_IMG}/012/main3.jpg`, catalogPage: 292,
      description: "広い軒下・カーポートに対応する大口径ダウンライト",
      features: JSON.stringify(["防雨型IP54", "φ150mm", "高輝度"]),
      beamAngle: 90, reachDistance: 3.0,
    },
    {
      name: "LEDアウトドアダウンライト スポット", modelNo: "HDD-S05L",
      categoryId: catMap["downlight"], price: 11200, lumen: 500,
      colorTemp: "昼白色 4000K", ipRating: "IP54", style: "モダン", watt: 5.0,
      imageUrl: `${BASE_IMG}/012/main5.jpg`, catalogPage: 294,
      description: "スポット配光タイプのアウトドアダウンライト",
      features: JSON.stringify(["防雨型IP54", "スポット配光", "首振り調整"]),
      beamAngle: 30, reachDistance: 3.5,
    },

    // ===== レールライト (013) =====
    {
      name: "LEDレールスポット シングル", modelNo: "HRS-D05L",
      categoryId: catMap["rail-light"], price: 8200, lumen: 400,
      colorTemp: "電球色 2700K", ipRating: "IP44", style: "モダン", watt: 5.0,
      imageUrl: `${BASE_IMG}/013/main1.jpg`, catalogPage: 318,
      description: "ライティングレールに取り付けるスポットライト",
      features: JSON.stringify(["防雨型IP44", "首振り調整", "レール対応"]),
      beamAngle: 30, reachDistance: 3.0,
    },
    {
      name: "LEDレールスポット ダブル", modelNo: "HRS-D10L",
      categoryId: catMap["rail-light"], price: 14500, lumen: 800,
      colorTemp: "電球色 2700K", ipRating: "IP44", style: "モダン", watt: 10.0,
      imageUrl: `${BASE_IMG}/013/main3.jpg`, catalogPage: 320,
      description: "2灯タイプで広範囲を照らすレールスポット",
      features: JSON.stringify(["防雨型IP44", "2灯タイプ", "各灯独立調整"]),
      beamAngle: 60, reachDistance: 4.0,
    },

    // ===== デッキライト (014) — PDF実型番 HCD系 =====
    { name: "デッキライト スクエア シルバー", modelNo: "HCD-D19S", categoryId: catMap["deck-light"], price: 8800, lumen: 80, colorTemp: "電球色 2700K", ipRating: "IP55", style: "モダン", watt: 2.0, imageUrl: `${BASE_IMG}/014/main1.jpg`, catalogPage: 45, description: "デッキ・幕板に埋め込むスクエアタイプのLEDデッキライト。シルバー。", features: JSON.stringify(["防雨型IP55", "埋込型", "スクエア", "シルバー"]), beamAngle: 90, reachDistance: 1.0 },
    { name: "デッキライト スクエア ホワイト", modelNo: "HCD-W19S", categoryId: catMap["deck-light"], price: 8800, lumen: 80, colorTemp: "電球色 2700K", ipRating: "IP55", style: "モダン", watt: 2.0, imageUrl: `${BASE_IMG}/014/main1.jpg`, catalogPage: 45, description: "デッキ・幕板に埋め込むスクエアタイプのLEDデッキライト。ホワイト。", features: JSON.stringify(["防雨型IP55", "埋込型", "スクエア", "ホワイト"]), beamAngle: 90, reachDistance: 1.0 },
    { name: "デッキライト スクエア ブラック", modelNo: "HCD-B19S", categoryId: catMap["deck-light"], price: 8800, lumen: 80, colorTemp: "電球色 2700K", ipRating: "IP55", style: "モダン", watt: 2.0, imageUrl: `${BASE_IMG}/014/main1.jpg`, catalogPage: 45, description: "デッキ・幕板に埋め込むスクエアタイプのLEDデッキライト。ブラック。", features: JSON.stringify(["防雨型IP55", "埋込型", "スクエア", "ブラック"]), beamAngle: 90, reachDistance: 1.0 },
    { name: "デッキライト 丸型ブロンズ シルバー B", modelNo: "HCD-D03B", categoryId: catMap["deck-light"], price: 7800, lumen: 60, colorTemp: "電球色 2700K", ipRating: "IP55", style: "クラシック", watt: 1.5, imageUrl: `${BASE_IMG}/014/main3.jpg`, catalogPage: 45, description: "丸型ブロンズタイプのLEDデッキライト。シルバー。幕板・笠木に。", features: JSON.stringify(["防雨型IP55", "埋込型", "丸型", "シルバー"]), beamAngle: 120, reachDistance: 1.0 },
    { name: "デッキライト 丸型ブロンズ シルバー G", modelNo: "HCD-D03G", categoryId: catMap["deck-light"], price: 7800, lumen: 60, colorTemp: "電球色 2700K", ipRating: "IP55", style: "クラシック", watt: 1.5, imageUrl: `${BASE_IMG}/014/main3.jpg`, catalogPage: 45, description: "丸型グロスタイプのLEDデッキライト。シルバー。幕板・笠木に。", features: JSON.stringify(["防雨型IP55", "埋込型", "丸型グロス", "シルバー"]), beamAngle: 120, reachDistance: 1.0 },
    { name: "デッキライト 丸型ブロンズ ホワイト B", modelNo: "HCD-W03B", categoryId: catMap["deck-light"], price: 7800, lumen: 60, colorTemp: "電球色 2700K", ipRating: "IP55", style: "クラシック", watt: 1.5, imageUrl: `${BASE_IMG}/014/main3.jpg`, catalogPage: 45, description: "丸型ブロンズタイプのLEDデッキライト。ホワイト。", features: JSON.stringify(["防雨型IP55", "埋込型", "丸型", "ホワイト"]), beamAngle: 120, reachDistance: 1.0 },
    { name: "デッキライト 丸型ブロンズ ホワイト G", modelNo: "HCD-W03G", categoryId: catMap["deck-light"], price: 7800, lumen: 60, colorTemp: "電球色 2700K", ipRating: "IP55", style: "クラシック", watt: 1.5, imageUrl: `${BASE_IMG}/014/main3.jpg`, catalogPage: 45, description: "丸型グロスタイプのLEDデッキライト。ホワイト。", features: JSON.stringify(["防雨型IP55", "埋込型", "丸型グロス", "ホワイト"]), beamAngle: 120, reachDistance: 1.0 },
    { name: "デッキライト 丸型ブロンズ ブラック B", modelNo: "HCD-B03B", categoryId: catMap["deck-light"], price: 7800, lumen: 60, colorTemp: "電球色 2700K", ipRating: "IP55", style: "モダン", watt: 1.5, imageUrl: `${BASE_IMG}/014/main3.jpg`, catalogPage: 45, description: "丸型ブロンズタイプのLEDデッキライト。ブラック。", features: JSON.stringify(["防雨型IP55", "埋込型", "丸型", "ブラック"]), beamAngle: 120, reachDistance: 1.0 },
    { name: "デッキライト ロングスクエア ホワイト", modelNo: "HCD-W17S", categoryId: catMap["deck-light"], price: 9800, lumen: 100, colorTemp: "電球色 2700K", ipRating: "IP55", style: "モダン", watt: 2.5, imageUrl: `${BASE_IMG}/014/main5.jpg`, catalogPage: 45, description: "ロングスクエアタイプのLEDデッキライト。ホワイト。階段・長スパンに。", features: JSON.stringify(["防雨型IP55", "埋込型", "ロングスクエア", "ホワイト"]), beamAngle: 90, reachDistance: 1.5 },
    { name: "デッキライト ロングスクエア ブラック", modelNo: "HCD-B17S", categoryId: catMap["deck-light"], price: 9800, lumen: 100, colorTemp: "電球色 2700K", ipRating: "IP55", style: "モダン", watt: 2.5, imageUrl: `${BASE_IMG}/014/main5.jpg`, catalogPage: 45, description: "ロングスクエアタイプのLEDデッキライト。ブラック。", features: JSON.stringify(["防雨型IP55", "埋込型", "ロングスクエア", "ブラック"]), beamAngle: 90, reachDistance: 1.5 },
    { name: "デッキライト ロングスクエア ブラック 2灯", modelNo: "HCD-B18S", categoryId: catMap["deck-light"], price: 11800, lumen: 140, colorTemp: "電球色 2700K", ipRating: "IP55", style: "モダン", watt: 3.5, imageUrl: `${BASE_IMG}/014/main5.jpg`, catalogPage: 45, description: "2灯タイプのロングスクエアLEDデッキライト。ブラック。", features: JSON.stringify(["防雨型IP55", "埋込型", "2灯タイプ", "ブラック"]), beamAngle: 90, reachDistance: 2.0 },


    // ===== フットライト (006) =====
    {
      name: "LEDフットライト 丸型", modelNo: "HFL-D01R",
      categoryId: catMap["foot-light"], price: 3200, lumen: 60,
      colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 1.0,
      imageUrl: `${BASE_IMG}/006/main1.jpg`, catalogPage: 270,
      description: "階段・足元を照らす丸型フットライト",
      features: JSON.stringify(["防雨型IP65", "埋込取付", "省エネ"]),
      beamAngle: 90, reachDistance: 0.8,
    },
    {
      name: "LEDフットライト 角型", modelNo: "HFL-D01S",
      categoryId: catMap["foot-light"], price: 3500, lumen: 70,
      colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 1.0,
      imageUrl: `${BASE_IMG}/006/main3.jpg`, catalogPage: 272,
      description: "スクエアデザインのフットライト",
      features: JSON.stringify(["防雨型IP65", "埋込取付", "スクエアデザイン"]),
      beamAngle: 90, reachDistance: 0.8,
    },

    // ===== 門柱灯 (002) =====
    {
      name: "LED門柱灯 スリム", modelNo: "HGT-S08L",
      categoryId: catMap["gate-light"], price: 15800, lumen: 600,
      colorTemp: "電球色 2700K", ipRating: "IP54", style: "モダン", watt: 8.0,
      imageUrl: `${BASE_IMG}/002/main1.jpg`, catalogPage: 60,
      description: "門柱に取り付けるスリムな表札灯",
      features: JSON.stringify(["防雨型IP54", "スリムデザイン", "表札照明"]),
      beamAngle: 180, reachDistance: 2.0,
    },
    {
      name: "LED門柱灯 クラシック", modelNo: "HGT-C10L",
      categoryId: catMap["gate-light"], price: 22800, lumen: 800,
      colorTemp: "電球色 2700K", ipRating: "IP54", style: "クラシック", watt: 10.0,
      imageUrl: `${BASE_IMG}/002/main3.jpg`, catalogPage: 63,
      description: "クラシックデザインの門柱灯",
      features: JSON.stringify(["防雨型IP54", "クラシックデザイン", "表札照明"]),
      beamAngle: 360, reachDistance: 2.5,
    },

    // ===== カーポートライト (004) =====
    {
      name: "LEDカーポートライト 直付型", modelNo: "HCP-D10L",
      categoryId: catMap["carport-light"], price: 16800, lumen: 900,
      colorTemp: "昼白色 4000K", ipRating: "IP54", style: "モダン", watt: 10.0,
      imageUrl: `${BASE_IMG}/004/main1.jpg`, catalogPage: 105,
      description: "カーポートの柱・天井に直付けする照明",
      features: JSON.stringify(["防雨型IP54", "直付取付", "広角配光"]),
      beamAngle: 120, reachDistance: 4.0,
    },
    {
      name: "LEDカーポートライト スポット", modelNo: "HCP-S08L",
      categoryId: catMap["carport-light"], price: 12500, lumen: 650,
      colorTemp: "昼白色 4000K", ipRating: "IP54", style: "モダン", watt: 8.0,
      imageUrl: `${BASE_IMG}/004/main3.jpg`, catalogPage: 107,
      description: "スポット配光でナンバープレートも見やすいカーポートライト",
      features: JSON.stringify(["防雨型IP54", "スポット配光", "首振り調整"]),
      beamAngle: 60, reachDistance: 5.0,
    },

    // ===== ソーラーライト (018) =====
    {
      name: "LEDソーラーパスライト", modelNo: "HSL-S02",
      categoryId: catMap["solar-light"], price: 4800, lumen: 80,
      colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 2.0,
      imageUrl: `${BASE_IMG}/018/main1.jpg`, catalogPage: 380,
      description: "配線不要のソーラー充電式パスライト",
      features: JSON.stringify(["ソーラー充電", "配線不要", "自動点灯"]),
      beamAngle: 120, reachDistance: 1.5,
    },
    {
      name: "LEDソーラースポット", modelNo: "HSL-SP05",
      categoryId: catMap["solar-light"], price: 7800, lumen: 200,
      colorTemp: "昼白色 4000K", ipRating: "IP65", style: "モダン", watt: 5.0,
      imageUrl: `${BASE_IMG}/018/main3.jpg`, catalogPage: 382,
      description: "スポット照射対応のソーラーライト",
      features: JSON.stringify(["ソーラー充電", "配線不要", "スポット配光"]),
      beamAngle: 60, reachDistance: 3.0,
    },

    // ===== デコレーションライト (015) =====
    {
      name: "LEDデコレーションライト ストレート 5m", modelNo: "HDC-ST5",
      categoryId: catMap["decoration-light"], price: 6800, lumen: 300,
      colorTemp: "電球色 2700K", ipRating: "IP44", style: "ナチュラル", watt: 6.0,
      imageUrl: `${BASE_IMG}/015/main1.jpg`, catalogPage: 395,
      description: "庭木・フェンスを彩るストレートイルミネーション",
      features: JSON.stringify(["防雨型IP44", "5m連結可", "屋外使用可"]),
      beamAngle: 360, reachDistance: 1.0,
    },
    {
      name: "LEDデコレーションライト カーテン", modelNo: "HDC-CT2",
      categoryId: catMap["decoration-light"], price: 8500, lumen: 400,
      colorTemp: "電球色 2700K", ipRating: "IP44", style: "ナチュラル", watt: 8.0,
      imageUrl: `${BASE_IMG}/015/main3.jpg`, catalogPage: 397,
      description: "カーテン状に垂らすデコレーションライト",
      features: JSON.stringify(["防雨型IP44", "カーテン型", "屋外使用可"]),
      beamAngle: 360, reachDistance: 1.0,
    },

    // ===== 和風ライト (017) =====
    {
      name: "LED和風ガーデンライト 行灯型", modelNo: "HJP-A08L",
      categoryId: catMap["japanese-light"], price: 28800, lumen: 450,
      colorTemp: "電球色 2700K", ipRating: "IP54", style: "和風", watt: 8.0,
      imageUrl: `${BASE_IMG}/017/main1.jpg`, catalogPage: 415,
      description: "和の庭に溶け込む行灯型ガーデンライト",
      features: JSON.stringify(["防雨型IP54", "和風デザイン", "行灯型"]),
      beamAngle: 360, reachDistance: 2.0,
    },
    {
      name: "LED和風ウォールライト 石目調", modelNo: "HJP-W06L",
      categoryId: catMap["japanese-light"], price: 19800, lumen: 350,
      colorTemp: "電球色 2700K", ipRating: "IP54", style: "和風", watt: 6.0,
      imageUrl: `${BASE_IMG}/017/main3.jpg`, catalogPage: 418,
      description: "石目調仕上げの和風ウォールライト",
      features: JSON.stringify(["防雨型IP54", "石目調仕上", "和風デザイン"]),
      beamAngle: 180, reachDistance: 1.5,
      maker: "TAKASHO",
    },
  ];

  // ===== LIXIL 美彩シリーズ (DC12V) =====
  const LIXIL_IMG = "https://www.lixil.co.jp/lineup/gate_fence/bisailight/feature/pic";
  const lixilProducts = [
    {
      name: "スパイクスポットライト 45°", modelNo: "SSP-G1E 45°",
      categoryId: catMap["garden-uplight"], price: 39000,
      colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 5.0,
      imageUrl: `${LIXIL_IMG}/spike_img_01.jpg`, catalogPage: 88,
      description: "LIXIL美彩シリーズ。DC12V対応スパイクスポットライト。45°照射角度で植栽を美しく演出。",
      features: JSON.stringify(["DC12V対応", "防水IP65", "照射角45°", "スパイク付属"]),
      beamAngle: 45, reachDistance: 3.0, voltage: "12V", maker: "LIXIL",
    },
    {
      name: "スパイクスポットライト 15°", modelNo: "SSP-G2E 15°",
      categoryId: catMap["garden-uplight"], price: 38000,
      colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 5.0,
      imageUrl: `${LIXIL_IMG}/spike_img_01.jpg`, catalogPage: 88,
      description: "LIXIL美彩シリーズ。DC12V対応スパイクスポットライト。15°狭角で遠距離の高木を集光照射。",
      features: JSON.stringify(["DC12V対応", "防水IP65", "狭角15°", "スパイク付属"]),
      beamAngle: 15, reachDistance: 5.0, voltage: "12V", maker: "LIXIL",
    },
    {
      name: "スパイクスポットライト 45°(大)", modelNo: "SSP-G3E 45°",
      categoryId: catMap["garden-uplight"], price: 57000,
      colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 8.0,
      imageUrl: `${LIXIL_IMG}/spike_img_01.jpg`, catalogPage: 88,
      description: "LIXIL美彩シリーズ。大型ボディのDC12Vスパイクスポットライト。45°照射で大型植栽を迫力演出。",
      features: JSON.stringify(["DC12V対応", "防水IP65", "照射角45°", "大型ボディ", "スパイク付属"]),
      beamAngle: 45, reachDistance: 5.0, voltage: "12V", maker: "LIXIL",
    },
    {
      name: "ベルトスポットライト", modelNo: "NSP-G1E",
      categoryId: catMap["wall-spotlight"], price: 29600,
      colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 4.0,
      imageUrl: "https://storage.googleapis.com/lixil-wp/sites/1/2025/01/b700c4c4-%E3%80%90%E6%96%B0%E3%80%91beltspot-img-01.jpg-%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC.jpg", catalogPage: 80,
      description: "LIXIL美彩シリーズ。DC12Vベルトスポットライト。壁面・外構を効果的に照らす。",
      features: JSON.stringify(["DC12V対応", "防水IP65", "ベルト取付"]),
      beamAngle: 30, reachDistance: 2.0, voltage: "12V", maker: "LIXIL",
    },
    {
      name: "ベルトスポットライト(2灯)", modelNo: "NSP-G2E",
      categoryId: catMap["wall-spotlight"], price: 42000,
      colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 8.0,
      imageUrl: "https://storage.googleapis.com/lixil-wp/sites/1/2025/01/b700c4c4-%E3%80%90%E6%96%B0%E3%80%91beltspot-img-01.jpg-%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC.jpg", catalogPage: 80,
      description: "LIXIL美彩シリーズ。DC12V 2灯ベルトスポットライト。広い壁面をダブルスポットで演出。",
      features: JSON.stringify(["DC12V対応", "防水IP65", "2灯タイプ", "ベルト取付"]),
      beamAngle: 30, reachDistance: 2.0, voltage: "12V", maker: "LIXIL",
    },
    {
      name: "スポットライト", modelNo: "SP-G1W 4V",
      categoryId: catMap["wall-spotlight"], price: 25600,
      colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 4.0,
      imageUrl: `${LIXIL_IMG}/spot_img_01.jpg`, catalogPage: 74,
      description: "LIXIL美彩シリーズ。DC12Vスポットライト。コンパクトボディで多様な取付け箇所に対応。",
      features: JSON.stringify(["DC12V対応", "防水IP65", "コンパクト"]),
      beamAngle: 30, reachDistance: 2.0, voltage: "12V", maker: "LIXIL",
    },
    {
      name: "スポットライト(2灯)", modelNo: "SP-G2W",
      categoryId: catMap["wall-spotlight"], price: 31000,
      colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 8.0,
      imageUrl: `${LIXIL_IMG}/spot_img_01.jpg`, catalogPage: 74,
      description: "LIXIL美彩シリーズ。DC12V 2灯スポットライト。ウォール・植栽に幅広く対応。",
      features: JSON.stringify(["DC12V対応", "防水IP65", "2灯タイプ"]),
      beamAngle: 30, reachDistance: 2.0, voltage: "12V", maker: "LIXIL",
    },
    {
      name: "ハイポールスポットライト H2500", modelNo: "SP-G1B/SP-G2B",
      categoryId: catMap["wall-spotlight"], price: 95200,
      colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 12.0,
      imageUrl: `${LIXIL_IMG}/spot_img_01.jpg`, catalogPage: 76,
      description: "LIXIL美彩シリーズ。H2500ハイポールスポットライト。高所から広範囲を照らすポール照明。",
      features: JSON.stringify(["DC12V対応", "防水IP65", "H2500ポール", "高所照射"]),
      beamAngle: 45, reachDistance: 6.0, voltage: "12V", maker: "LIXIL",
    },
    {
      name: "ダウンスポットライト", modelNo: "DSP-G1H",
      categoryId: catMap["downlight"], price: 29500,
      colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 5.0,
      imageUrl: `${LIXIL_IMG}/downspot_img_01.jpg`, catalogPage: 78,
      description: "LIXIL美彩シリーズ。DC12Vダウンスポットライト。軒下・天井に設置してスポット照射。",
      features: JSON.stringify(["DC12V対応", "防水IP65", "ダウンスポット", "軒下取付"]),
      beamAngle: 30, reachDistance: 2.0, voltage: "12V", maker: "LIXIL",
    },
    {
      name: "ダウンライト 30°", modelNo: "DL-G1E 30°",
      categoryId: catMap["downlight"], price: 15000,
      colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 3.0,
      imageUrl: `${LIXIL_IMG}/downlight_img_01.jpg`, catalogPage: 82,
      description: "LIXIL美彩シリーズ。DC12Vダウンライト。30°集光タイプ。軒天・フェンスへの取付けに。",
      features: JSON.stringify(["DC12V対応", "防水IP65", "30°集光", "コンパクト"]),
      beamAngle: 30, reachDistance: 1.5, voltage: "12V", maker: "LIXIL",
    },
    {
      name: "ダウンライト(センサー付)", modelNo: "DL-G2E",
      categoryId: catMap["downlight"], price: 25000,
      colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 3.0,
      imageUrl: `${LIXIL_IMG}/downlight_img_01.jpg`, catalogPage: 82,
      description: "LIXIL美彩シリーズ。DC12V人感センサー付きダウンライト。来客時自動点灯で防犯にも。",
      features: JSON.stringify(["DC12V対応", "防水IP65", "人感センサー付き", "自動点灯"]),
      beamAngle: 30, reachDistance: 1.5, voltage: "12V", maker: "LIXIL",
    },
    {
      name: "ユニバーサルダウンライト 30°", modelNo: "UDL-G1E 30°",
      categoryId: catMap["downlight"], price: 26000,
      colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 5.0,
      imageUrl: `${LIXIL_IMG}/universaldown01.jpg`, catalogPage: 84,
      description: "LIXIL美彩シリーズ。DC12Vユニバーサルダウンライト。首振り機能付きで照射方向を自由に調整。",
      features: JSON.stringify(["DC12V対応", "防水IP65", "首振り調整", "30°集光"]),
      beamAngle: 30, reachDistance: 2.0, voltage: "12V", maker: "LIXIL",
    },
    {
      name: "スクエアシーリングライト", modelNo: "SCL-G1E",
      categoryId: catMap["downlight"], price: 60000,
      colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 10.0,
      imageUrl: `${LIXIL_IMG}/squareceiling01.jpg`, catalogPage: 86,
      description: "LIXIL美彩シリーズ。DC12Vスクエアシーリングライト。スタイリッシュな角形デザインの天井照明。",
      features: JSON.stringify(["DC12V対応", "防水IP65", "スクエアデザイン", "天井取付"]),
      beamAngle: 120, reachDistance: 2.0, voltage: "12V", maker: "LIXIL",
    },
    {
      name: "フロアアッパーライト 1V", modelNo: "FUP-G1E 1V",
      categoryId: catMap["garden-uplight"], price: 48000,
      colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 6.0,
      imageUrl: "https://storage.googleapis.com/lixil-wp/sites/1/2025/02/16d4de51-%E3%80%90%E6%96%B0%E3%80%91floorupper-img-01.jpg-%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC.jpg", catalogPage: 94,
      description: "LIXIL美彩シリーズ。DC12Vフロアアッパーライト。地面設置で植栽・壁面を下からウォッシュ照射。",
      features: JSON.stringify(["DC12V対応", "防水IP65", "フロア設置", "アップライト"]),
      beamAngle: 60, reachDistance: 2.0, voltage: "12V", maker: "LIXIL",
    },
    {
      name: "フロアアッパーライト 4V", modelNo: "FUP-G2E 4V",
      categoryId: catMap["garden-uplight"], price: 45000,
      colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 10.0,
      imageUrl: "https://storage.googleapis.com/lixil-wp/sites/1/2025/02/16d4de51-%E3%80%90%E6%96%B0%E3%80%91floorupper-img-01.jpg-%E3%81%AE%E3%82%B3%E3%83%94%E3%83%BC.jpg", catalogPage: 94,
      description: "LIXIL美彩シリーズ。DC12V 4灯フロアアッパーライト。広い壁面・植栽エリアを効率よく照らす。",
      features: JSON.stringify(["DC12V対応", "防水IP65", "4灯フロア設置", "広角照射"]),
      beamAngle: 90, reachDistance: 3.0, voltage: "12V", maker: "LIXIL",
    },
    {
      name: "グランドライト 1°", modelNo: "GND-G1E 1°",
      categoryId: catMap["ground-light"], price: 26000,
      colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 3.0,
      imageUrl: `${LIXIL_IMG}/ground_img_01.jpg`, catalogPage: 96,
      description: "LIXIL美彩シリーズ。DC12Vグランドライト。地中埋込型。超狭角1°で遠距離を集光照射。",
      features: JSON.stringify(["DC12V対応", "防水IP67", "地中埋込", "超狭角1°"]),
      beamAngle: 1, reachDistance: 8.0, voltage: "12V", maker: "LIXIL",
    },
    {
      name: "グランドライト 15°", modelNo: "GND-G2E 15°",
      categoryId: catMap["ground-light"], price: 33000,
      colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 5.0,
      imageUrl: `${LIXIL_IMG}/ground_img_01.jpg`, catalogPage: 96,
      description: "LIXIL美彩シリーズ。DC12Vグランドライト地中埋込型。15°集光で植栽・壁面を力強く照射。",
      features: JSON.stringify(["DC12V対応", "防水IP67", "地中埋込", "狭角15°"]),
      beamAngle: 15, reachDistance: 5.0, voltage: "12V", maker: "LIXIL",
    },
    {
      name: "グランドスポットライト 15°", modelNo: "GSP-G1E 15°",
      categoryId: catMap["ground-light"], price: 42500,
      colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 8.0,
      imageUrl: `${LIXIL_IMG}/groundspot_img_01.jpg`, catalogPage: 98,
      description: "LIXIL美彩シリーズ。DC12Vグランドスポットライト。地中埋込・高出力で高木を力強く照射。",
      features: JSON.stringify(["DC12V対応", "防水IP67", "地中埋込", "狭角15°", "高出力"]),
      beamAngle: 15, reachDistance: 7.0, voltage: "12V", maker: "LIXIL",
    },
    {
      name: "ユニバーサルグランドライト", modelNo: "UGL-G1E",
      categoryId: catMap["ground-light"], price: 39500,
      colorTemp: "電球色 2700K", ipRating: "IP67", style: "モダン", watt: 7.0,
      imageUrl: `${LIXIL_IMG}/universalground_img_01.jpg`, catalogPage: 100,
      description: "LIXIL美彩シリーズ。DC12Vユニバーサルグランドライト。地中埋込型で首振り照射方向調整が可能。",
      features: JSON.stringify(["DC12V対応", "防水IP67", "地中埋込", "首振り調整"]),
      beamAngle: 30, reachDistance: 4.0, voltage: "12V", maker: "LIXIL",
    },
    {
      name: "シームレスラインライト", modelNo: "SLL-L100",
      categoryId: catMap["rail-light"], price: 47000,
      colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 10.0,
      imageUrl: `${LIXIL_IMG}/seamlessline-img-01.jpg`, catalogPage: 102,
      description: "LIXIL美彩シリーズ。DC12Vシームレスラインライト。100cmライン照明でフェンス・壁面を均一に演出。",
      features: JSON.stringify(["DC12V対応", "防水IP65", "100cmライン", "シームレス"]),
      beamAngle: 120, reachDistance: 1.0, voltage: "12V", maker: "LIXIL",
    },
    {
      name: "スリムシームレスラインライト", modelNo: "SSLK-L40",
      categoryId: catMap["rail-light"], price: 44500,
      colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 5.0,
      imageUrl: `${LIXIL_IMG}/slimseamlessline-img-01.jpg`, catalogPage: 102,
      description: "LIXIL美彩シリーズ。DC12Vスリムシームレスラインライト。40cmコンパクトサイズで狭所にも対応。",
      features: JSON.stringify(["DC12V対応", "防水IP65", "40cmスリム", "シームレス"]),
      beamAngle: 120, reachDistance: 1.0, voltage: "12V", maker: "LIXIL",
    },
    {
      name: "ウォールバーライト 40cm", modelNo: "WBL-1 40",
      categoryId: catMap["wall-light"], price: 25000,
      colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 5.0,
      imageUrl: `${LIXIL_IMG}/wallbar_img_01.jpg`, catalogPage: 92,
      description: "LIXIL美彩シリーズ。DC12Vウォールバーライト40cm。壁面・門柱をバー状に均一照射。",
      features: JSON.stringify(["DC12V対応", "防水IP65", "40cm", "壁面取付"]),
      beamAngle: 120, reachDistance: 1.0, voltage: "12V", maker: "LIXIL",
    },
    {
      name: "ウォールバーライト 120cm", modelNo: "WBL-1 120",
      categoryId: catMap["wall-light"], price: 38000,
      colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 12.0,
      imageUrl: `${LIXIL_IMG}/wallbar_img_01.jpg`, catalogPage: 92,
      description: "LIXIL美彩シリーズ。DC12Vウォールバーライト120cm。広い壁面を端から端まで均一に演出。",
      features: JSON.stringify(["DC12V対応", "防水IP65", "120cm", "壁面取付"]),
      beamAngle: 120, reachDistance: 1.5, voltage: "12V", maker: "LIXIL",
    },
    {
      name: "スタンドスポットライト H600", modelNo: "GST-G2B",
      categoryId: catMap["pole-light"], price: 41700,
      colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 6.0,
      imageUrl: `${LIXIL_IMG}/stand_img_01.jpg`, catalogPage: 90,
      description: "LIXIL美彩シリーズ。DC12V H600スタンドスポットライト。スリムポールで植栽・アプローチを演出。",
      features: JSON.stringify(["DC12V対応", "防水IP65", "H600ポール", "スタンド式"]),
      beamAngle: 45, reachDistance: 2.0, voltage: "12V", maker: "LIXIL",
    },
    {
      name: "ラインペンダントライト", modelNo: "LPL-L100",
      categoryId: catMap["rail-light"], price: 94000,
      colorTemp: "電球色 2700K", ipRating: "IP44", style: "モダン", watt: 15.0,
      imageUrl: `${LIXIL_IMG}/linepnedant01.jpg`, catalogPage: 72,
      description: "LIXIL美彩シリーズ。DC12Vラインペンダントライト。テラス・軒下に吊り下げて空間を演出する100cmライン照明。",
      features: JSON.stringify(["DC12V対応", "防水IP44", "100cmペンダント", "テラス向け"]),
      beamAngle: 120, reachDistance: 2.0, voltage: "12V", maker: "LIXIL",
    },
    {
      name: "フェンスAL シームレスライン", modelNo: "FAL-L",
      categoryId: catMap["wall-light"], price: 85000,
      colorTemp: "電球色 2700K", ipRating: "IP65", style: "モダン", watt: 14.0,
      imageUrl: `${LIXIL_IMG}/line_img_01.jpg`, catalogPage: 106,
      description: "LIXIL美彩シリーズ。DC12Vフェンス対応シームレスラインライト。アルミフェンスに組み込んで一体感のある演出を実現。",
      features: JSON.stringify(["DC12V対応", "防水IP65", "フェンス一体型", "シームレスライン"]),
      beamAngle: 120, reachDistance: 1.5, voltage: "12V", maker: "LIXIL",
    },
  ];

  await db.insert(schema.products).values([...products, ...lixilProducts]);

  console.log(`✅ Seed complete! ${categoryData.length} categories, ${products.length + lixilProducts.length} products (${products.length} TAKASHO + ${lixilProducts.length} LIXIL)`);
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
