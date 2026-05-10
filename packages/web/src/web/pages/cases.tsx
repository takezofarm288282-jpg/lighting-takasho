import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, ExternalLink, MapPin, Lightbulb, ChevronDown, ChevronUp, BookOpen } from "lucide-react";

// ─────────────────────────────────────────────
// 事例データ
// ─────────────────────────────────────────────

interface CaseStudy {
  id: string;
  category: string;
  categoryEn: string;
  tagline: string;
  description: string;
  spread: { left: string; right: string };   // 見開き左右
  products: { code: string; name: string; page: string }[];
  tips: string[];
  color: string;
  accentLight: string; // lighter tint for gradient
}

const CASE_STUDIES: CaseStudy[] = [
  {
    id: "entrance",
    category: "エントランス",
    categoryEn: "Entrance",
    tagline: "おもてなしの光",
    description:
      "エントランスは、訪れる人にとっての第一印象を決める大切な接点。表札を見せるなどの機能はもちろん、人をもてなす気持ちなど、ライティングは情緒を表す手段にもなります。門柱・アプローチ・壁面を立体的に照らすことで、昼間とは異なる格調ある顔を演出します。",
    spread: { left: "/cases/P14_15_page-1.jpg", right: "/cases/P14_15_page-2.jpg" },
    products: [
      { code: "HCA-D25C", name: "ポールライト", page: "P.151" },
      { code: "HBB-D71C", name: "スポットライト", page: "P.049" },
      { code: "HBB-D148C", name: "スポットライト（大型）", page: "P.070" },
      { code: "HBF-D43K", name: "フラットスポット", page: "P.156" },
      { code: "HBC-D94K", name: "ウォールウォッシュ", page: "P.143" },
      { code: "ドットレスLEDバーレール付 低Wタイプ", name: "ラインライト", page: "P.169" },
    ],
    tips: [
      "表札・門柱は真上や斜め45°からスポットで照らすと立体感が出る",
      "アプローチ足元には低Wのバーライトで連続感を演出",
      "色温度は2700K（電球色）が温かみのある歓迎感を表現",
      "壁面ウォッシュ+スポットの組み合わせで奥行きを演出",
    ],
    color: "#c8a84b",
    accentLight: "#f0d87888",
  },
  {
    id: "garden",
    category: "ガーデン",
    categoryEn: "Garden",
    tagline: "安らぎと憩いの光",
    description:
      "一日の終わりを彩る庭の光。奥行きを感じさせるライティングが開放感を演出し、暗がりを楽しめるデザインが心に憩いをあたえてくれます。植栽のシルエット、水面の揺らぎ、石畳のテクスチャ——自然の素材を光で引き立てることが庭の魅力を最大化する鍵です。",
    spread: { left: "/cases/P16_17_page-1.jpg", right: "/cases/P16_17_page-2.jpg" },
    products: [
      { code: "HBH-D07B", name: "グランドライト", page: "P.207" },
      { code: "HGB-D09T", name: "スパイクスポット", page: "P.246" },
      { code: "HBF-D10C", name: "フラットスポット", page: "P.157" },
      { code: "HAC-D21T", name: "アッパーライト", page: "P.173" },
      { code: "HBB-D74C", name: "スポットライト", page: "P.051" },
      { code: "HBB-C43C", name: "スポットライト（コンパクト）", page: "P.081" },
      { code: "HBB-D110K", name: "スポットライト（ワイド）", page: "P.062" },
    ],
    tips: [
      "樹木は根元からのアッパーライトで幹の質感・枝のシルエットを表現",
      "地面を這わせるグランドライトは足元の安全確保と同時にムード演出に",
      "高木・低木・地被の3レイヤーで照明に奥行きをつける",
      "常時点灯より人感センサー活用で消費電力を大幅削減",
    ],
    color: "#5a9e6f",
    accentLight: "#7dd49888",
  },
  {
    id: "terrace",
    category: "テラス",
    categoryEn: "Terrace",
    tagline: "心踊る優雅な光",
    description:
      "明るさを高く配置すると愉しさが、低くすると落ち着きが生まれます。その場所で過ごす人の視界を意識したライティングが、優雅な時間を演出します。テラスは室内と屋外の「境界」——建物の光とランドスケープ照明をつなぐ重要な役割を担います。",
    spread: { left: "/cases/P18_19_page-1.jpg", right: "/cases/P18_19_page-2.jpg" },
    products: [
      { code: "HBC-D87R", name: "ウォールウォッシュ", page: "P.126" },
      { code: "HBF-D40H", name: "スポットライト", page: "P.261" },
      { code: "HHA-D18S", name: "ペンダント", page: "P.189" },
      { code: "HBA-D37N", name: "ウォールライト", page: "P.280" },
      { code: "HBD-D27S", name: "ダウンライト", page: "P.107" },
      { code: "ドットレスLEDバーレール付 低Wタイプ", name: "ラインライト", page: "P.169" },
    ],
    tips: [
      "テーブル面から80〜100cm上に照明を設置するとダイニング感が出る",
      "ライン照明は天井・床どちらに入れても「境界線」として機能する",
      "対外への光漏れを抑えるカットオフ型で隣接空間への配慮を",
      "防水・防塵等級はIP44以上を選択（雨がかかる場所はIP65推奨）",
    ],
    color: "#5b8db8",
    accentLight: "#7ab4e888",
  },
  {
    id: "landscape",
    category: "ランドスケープ",
    categoryEn: "Landscape",
    tagline: "感動を生む光",
    description:
      "その場所を活かし、丁寧にデザインされた光がもたらす、日常では体験できない感動。ここにしかない景色と光の組み合わせが、滞在するお客様に最高の時間を届けます。公園・商業施設・ホテルなど大規模空間では、演出効果と省エネ性能の両立が求められます。",
    spread: { left: "/cases/P20_21_page-1.jpg", right: "/cases/P20_21_page-2.jpg" },
    products: [
      { code: "HBD-D41S", name: "ダウンライト（大型）", page: "P.107" },
      { code: "HHA-D25S", name: "スパイクスポット", page: "P.191" },
      { code: "HBB-D79C", name: "スポットライト", page: "P.050" },
      { code: "HBB-D77C", name: "スポットライト（ワイド）", page: "P.048" },
      { code: "HBC-D84P", name: "ウォールウォッシュ（大型）", page: "P.131" },
      { code: "HBB-D155K", name: "スポットライト（超大型）", page: "P.058" },
      { code: "特注RGBライト", name: "RGBカラーライト", page: "特注" },
    ],
    tips: [
      "大空間は複数の照明器具を使った「重ね合わせ」で立体感を演出",
      "RGBライトはイベント・季節演出に活用、通常時は白色固定で消費電力を抑制",
      "ランドスケープ照明は「見せる」だけでなく「安全動線」を確保する機能も重要",
      "中・高演色（Ra85以上）の光源で植栽の緑の鮮やかさを引き出す",
    ],
    color: "#8a6bbf",
    accentLight: "#b09ae888",
  },
];

// ─────────────────────────────────────────────
// CaseArticle — 1事例の記事コンポーネント
// ─────────────────────────────────────────────

function CaseArticle({ cs, index }: { cs: CaseStudy; index: number }) {
  const [prodOpen, setProdOpen] = useState(false);
  const isEven = index % 2 === 0;

  return (
    <article style={{ marginBottom: 80 }}>
      {/* ── カテゴリ見出し ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
        <div style={{ width: 4, height: 48, borderRadius: 2, background: cs.color, flexShrink: 0 }} />
        <div>
          <div style={{
            fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase",
            color: cs.color, fontFamily: "'Playfair Display', serif", marginBottom: 4,
          }}>
            {cs.categoryEn}
          </div>
          <h2 style={{
            margin: 0, fontSize: 30, fontWeight: 700,
            fontFamily: "'Noto Serif JP', serif", color: "var(--color-text)",
          }}>
            {cs.category}
            <span style={{ fontSize: 16, fontWeight: 400, color: "var(--color-text-muted)", marginLeft: 14, fontFamily: "'Noto Serif JP', serif" }}>
              — {cs.tagline}
            </span>
          </h2>
        </div>
      </div>

      {/* ── 見開きスプレッド ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isEven ? "1fr 1fr" : "1fr 1fr",
        gap: 3,
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: `0 8px 40px ${cs.color}30, 0 2px 8px rgba(0,0,0,0.4)`,
        marginBottom: 32,
        background: "#000",
      }}>
        {/* 左ページ */}
        <div style={{ position: "relative", overflow: "hidden" }}>
          <img
            src={cs.spread.left}
            alt={`${cs.category} 事例 左ページ`}
            style={{ width: "100%", height: "auto", display: "block" }}
          />
          {/* ページ番号的な小ラベル */}
          <div style={{
            position: "absolute", bottom: 10, left: 10,
            background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
            color: "#fff", fontSize: 10, padding: "3px 8px", borderRadius: 4,
            fontFamily: "'Noto Sans JP', sans-serif", letterSpacing: "0.05em",
          }}>
            {cs.categoryEn} / 01
          </div>
        </div>
        {/* 右ページ */}
        <div style={{ position: "relative", overflow: "hidden" }}>
          <img
            src={cs.spread.right}
            alt={`${cs.category} 事例 右ページ`}
            style={{ width: "100%", height: "auto", display: "block" }}
          />
          <div style={{
            position: "absolute", bottom: 10, right: 10,
            background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
            color: "#fff", fontSize: 10, padding: "3px 8px", borderRadius: 4,
            fontFamily: "'Noto Sans JP', sans-serif", letterSpacing: "0.05em",
          }}>
            {cs.categoryEn} / 02
          </div>
        </div>
      </div>

      {/* ── 本文 + ポイント + 製品 ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 320px",
        gap: 32,
        alignItems: "start",
      }}>
        {/* 左：説明 + 製品リスト */}
        <div>
          <p style={{
            fontSize: 15, lineHeight: 1.95, color: "var(--color-text-muted)",
            fontFamily: "'Noto Sans JP', sans-serif", margin: "0 0 24px",
          }}>
            {cs.description}
          </p>

          {/* 使用製品アコーディオン */}
          <div style={{
            border: "1px solid var(--color-border)",
            borderRadius: 10, overflow: "hidden",
          }}>
            <button
              onClick={() => setProdOpen(!prodOpen)}
              style={{
                width: "100%", display: "flex", alignItems: "center",
                justifyContent: "space-between", padding: "12px 16px",
                background: "var(--color-surface)", border: "none",
                cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif",
                fontSize: 13, fontWeight: 600, color: "var(--color-text)",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <MapPin size={14} style={{ color: cs.color }} />
                使用製品一覧（{cs.products.length}点）
              </span>
              {prodOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
            {prodOpen && (
              <div style={{
                padding: "12px 16px 16px",
                background: "var(--color-bg)",
                display: "flex", flexWrap: "wrap", gap: 8,
              }}>
                {cs.products.map((p) => (
                  <div key={p.code} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: "var(--color-surface)",
                    border: `1px solid ${cs.color}33`,
                    borderRadius: 8, padding: "6px 12px",
                  }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: cs.color, fontFamily: "monospace" }}>{p.code}</span>
                    <span style={{ fontSize: 11, color: "var(--color-text-muted)", fontFamily: "'Noto Sans JP', sans-serif" }}>{p.name}</span>
                    <span style={{ fontSize: 10, color: "var(--color-text-muted)", opacity: 0.6, fontFamily: "'Noto Sans JP', sans-serif" }}>{p.page}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 右：プランニングポイント */}
        <div style={{
          background: `linear-gradient(160deg, ${cs.color}18 0%, ${cs.color}08 100%)`,
          border: `1px solid ${cs.color}30`,
          borderRadius: 12, padding: "20px 20px 24px",
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            fontSize: 12, fontWeight: 700, color: cs.color, marginBottom: 16,
            fontFamily: "'Noto Sans JP', sans-serif", letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}>
            <Lightbulb size={14} />
            プランニングのポイント
          </div>
          <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 14 }}>
            {cs.tips.map((tip, i) => (
              <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{
                  flexShrink: 0, width: 22, height: 22, borderRadius: "50%",
                  background: cs.color, color: "#0d1a0d",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 800, marginTop: 1,
                }}>
                  {i + 1}
                </span>
                <span style={{
                  fontSize: 13, lineHeight: 1.75, color: "var(--color-text)",
                  fontFamily: "'Noto Sans JP', sans-serif",
                }}>
                  {tip}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* 区切り線 */}
      <div style={{
        marginTop: 56, height: 1,
        background: `linear-gradient(90deg, transparent, ${cs.color}44, transparent)`,
      }} />
    </article>
  );
}

// ─────────────────────────────────────────────
// ページ本体
// ─────────────────────────────────────────────

export default function CasesPage() {
  const [, setLocation] = useLocation();

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--color-bg)",
      color: "var(--color-text)",
      fontFamily: "'Noto Sans JP', sans-serif",
    }}>

      {/* ── ヘッダー ── */}
      <header style={{
        background: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
        padding: "14px 28px",
        display: "flex", alignItems: "center", gap: 16,
        position: "sticky", top: 0, zIndex: 100,
        backdropFilter: "blur(12px)",
      }}>
        <button
          onClick={() => setLocation("/")}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "none", border: "1px solid var(--color-border)",
            borderRadius: 8, padding: "6px 12px", cursor: "pointer",
            color: "var(--color-text-muted)", fontSize: 13,
            fontFamily: "'Noto Sans JP', sans-serif",
          }}
        >
          <ArrowLeft size={14} />
          セレクターへ戻る
        </button>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: 1 }}>
            Lighting Portfolio
          </div>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, fontFamily: "'Noto Serif JP', serif" }}>
            <span style={{ color: "var(--color-accent)" }}>ライティング</span> 事例集
          </h1>
        </div>

        {/* ジャンプナビ */}
        <nav style={{ display: "flex", gap: 6 }}>
          {CASE_STUDIES.map((cs) => (
            <a
              key={cs.id}
              href={`#${cs.id}`}
              style={{
                padding: "5px 14px", borderRadius: 20,
                border: `1px solid ${cs.color}55`,
                color: cs.color, fontSize: 12, fontWeight: 600,
                fontFamily: "'Noto Sans JP', sans-serif",
                textDecoration: "none",
                background: `${cs.color}12`,
              }}
            >
              {cs.category}
            </a>
          ))}
        </nav>
      </header>

      {/* ── ヒーローバナー ── */}
      <div style={{
        background: "linear-gradient(135deg, #0a0a00 0%, #0d1a0d 40%, #0a0010 100%)",
        padding: "60px 28px 52px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* 装飾ライン */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(200,168,75,0.12) 0%, transparent 70%)",
        }} />
        <div style={{ position: "relative", maxWidth: 700, margin: "0 auto" }}>
          <div style={{
            display: "inline-block",
            fontSize: 11, letterSpacing: "0.3em", color: "#c8a84b",
            textTransform: "uppercase", marginBottom: 16,
            fontFamily: "'Playfair Display', serif",
            borderBottom: "1px solid #c8a84b44", paddingBottom: 10,
          }}>
            Takasho Lighting Portfolio 2026
          </div>
          <h2 style={{
            fontSize: 38, fontWeight: 700, margin: "0 0 18px",
            fontFamily: "'Noto Serif JP', serif",
            background: "linear-gradient(120deg, #c8a84b, #f5e490, #c8a84b)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            lineHeight: 1.3,
          }}>
            空間を変える、光のデザイン
          </h2>
          <p style={{
            fontSize: 14, color: "#ffffff88", lineHeight: 1.95, margin: 0,
            fontFamily: "'Noto Sans JP', sans-serif",
          }}>
            エントランス・ガーデン・テラス・ランドスケープ——<br />
            各空間に最適なローボルト® 照明の実例と、プランニングのポイントを解説します。
          </p>
        </div>
      </div>

      {/* ── 目次 ── */}
      <div style={{
        maxWidth: 900, margin: "0 auto", padding: "32px 28px 0",
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12,
      }}>
        {CASE_STUDIES.map((cs, i) => (
          <a
            key={cs.id}
            href={`#${cs.id}`}
            style={{
              textDecoration: "none",
              display: "flex", flexDirection: "column",
              border: `1px solid ${cs.color}44`,
              borderRadius: 12, overflow: "hidden",
              background: "var(--color-surface)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
          >
            <img
              src={cs.spread.left}
              alt={cs.category}
              style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", display: "block" }}
            />
            <div style={{ padding: "10px 12px" }}>
              <div style={{ fontSize: 10, color: cs.color, letterSpacing: "0.1em", marginBottom: 2, fontFamily: "'Playfair Display', serif" }}>
                {String(i + 1).padStart(2, "0")}  {cs.categoryEn}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text)", fontFamily: "'Noto Serif JP', serif" }}>
                {cs.category}
              </div>
              <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 2, fontFamily: "'Noto Sans JP', sans-serif" }}>
                {cs.tagline}
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* ── 記事本文 ── */}
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "56px 28px 32px" }}>
        {CASE_STUDIES.map((cs, i) => (
          <div key={cs.id} id={cs.id} style={{ scrollMarginTop: 80 }}>
            <CaseArticle cs={cs} index={i} />
          </div>
        ))}

        {/* フッターノート */}
        <div style={{
          marginTop: 32, padding: "28px 32px",
          border: "1px solid var(--color-border)",
          borderRadius: 16, background: "var(--color-surface)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 24, flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <BookOpen size={16} style={{ color: "var(--color-text-muted)", flexShrink: 0, marginTop: 2 }} />
            <p style={{
              margin: 0, fontSize: 13, color: "var(--color-text-muted)",
              lineHeight: 1.8, fontFamily: "'Noto Sans JP', sans-serif",
            }}>
              掲載写真・型番は<strong style={{ color: "var(--color-text)" }}>株式会社タカショー カタログ 2026</strong> より抜粋。<br />
              製品の詳細・在庫確認は <strong style={{ color: "var(--color-text)" }}>Takezo Farm</strong> までお問い合わせください。
            </p>
          </div>
          <button
            onClick={() => setLocation("/")}
            style={{
              flexShrink: 0,
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "var(--color-accent)", color: "#0d1a0d",
              border: "none", borderRadius: 10, padding: "10px 22px",
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              fontFamily: "'Noto Sans JP', sans-serif",
            }}
          >
            <ExternalLink size={13} />
            商品セレクターへ
          </button>
        </div>
      </main>
    </div>
  );
}
